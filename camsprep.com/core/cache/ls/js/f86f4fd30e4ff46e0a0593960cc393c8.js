(function($) {
    'use strict';
    let gameState = {
        attemptId: null,
        currentQuestion: null,
        questionIndex: 0,
        timerInterval: null,
        timeLeft: 60,
        timerPaused: !1,
        gameStartTime: null,
        questionStartTime: null,
        lifelinesUsed: {
            skip: !1,
            timer: !1,
            guru: !1,
            revival: !1
        },
        preloadedData: null,
        isPreloading: !1,
        guestUuid: null,
    };
    let sounds = {};

    function getCookie(name) {
        const value = '; ' + document.cookie;
        const parts = value.split('; ' + name + '=');
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null
    }

    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + d.toUTCString() + '; path=' + (amlQuiz.cookiePath || '/') + '; SameSite=Lax'
    }

    function setupSounds() {
        sounds = {
            bg: document.getElementById('bg-music'),
            start: document.getElementById('start-click-sound'),
            load: document.getElementById('question-load-sound'),
            correct: document.getElementById('correct-sound'),
            wrong: document.getElementById('wrong-sound'),
            gameOver: document.getElementById('game-over-sound'),
        }
    }

    function playSound(audio) {
        if (audio) {
            if (localStorage.getItem('aml_quiz_muted') === 'true') audio.muted = !0;
            audio.currentTime = 0;
            audio.play().catch(() => {})
        }
    }

    function updateMuteState(isMuted) {
        for (const key in sounds) {
            if (sounds[key]) sounds[key].muted = isMuted
        }
        if (isMuted) {
            $('#master-mute-btn').addClass('muted').attr('title', 'Unmute Sound');
            $('#mute-icon-on').addClass('hidden');
            $('#mute-icon-off').removeClass('hidden')
        } else {
            $('#master-mute-btn').removeClass('muted').attr('title', 'Mute Sound');
            $('#mute-icon-on').removeClass('hidden');
            $('#mute-icon-off').addClass('hidden')
        }
    }

    function initQuiz() {
        setupSounds();
        let isMuted = localStorage.getItem('aml_quiz_muted') === 'true';
        updateMuteState(isMuted);
        $('#master-mute-btn').on('click', function() {
            isMuted = !isMuted;
            localStorage.setItem('aml_quiz_muted', isMuted);
            updateMuteState(isMuted)
        });
        gameState.guestUuid = getCookie('aml_guest_uuid') || null;
        if (!gameState.guestUuid && amlQuiz.hasGuestCookie) {
            gameState.guestUuid = 'returning_guest'
        }
        $('#start-btn').on('click', startQuiz);
        $('#aml-guest-form').on('submit', handleGuestSubmit);
        $('#rules-start-game-btn').on('click', launchGame);
        $('#revival-btn').on('click', handleRevival);
        $('#restart-btn, #victory-restart-btn').on('click', () => location.reload());
        $('#guru-ok-btn').on('click', () => {
            $('#guru-popup').fadeOut(300).addClass('hidden');
            gameState.timerPaused = !1
        });
        $(document).on('click', '.option-btn:not(.disabled)', function() {
            selectOption($(this).data('answer'), $(this))
        });
        $('.aml-lifeline').on('click', function() {
            useLifeline($(this).data('lifeline'), $(this))
        })
    }

    function startQuiz() {
        playSound(sounds.start);
        if (gameState.guestUuid || amlQuiz.hasGuestCookie) {
            preloadGame();
            showRulesScreen()
        } else {
            $('#welcome-screen').fadeOut(300, function() {
                $(this).addClass('hidden');
                $('#guest-screen').removeClass('hidden').fadeIn(500)
            })
        }
    }

    function handleGuestSubmit(e) {
        e.preventDefault();
        const $btn = $(this).find('button[type="submit"]');
        const $msg = $(this).find('.cyber-status-msg');
        const display_name = $('#guest_display_name').val().trim();
        const $countryOpt = $('#guest_country option:selected');
        const country = $countryOpt.val();
        const country_code = $countryOpt.data('code') || '';
        if (!display_name) {
            $msg.removeClass('success').addClass('error').text('Please enter your name.').fadeIn();
            return
        }
        if (!country) {
            $msg.removeClass('success').addClass('error').text('Please select your country.').fadeIn();
            return
        }
        $btn.prop('disabled', !0).text('ESTABLISHING UPLINK...');
        $msg.hide();
        $.post(amlQuiz.ajaxUrl, {
            action: 'aml_guest_start',
            nonce: amlQuiz.nonce,
            display_name: display_name,
            country: country,
            country_code: country_code,
        }, function(response) {
            if (response.success) {
                gameState.guestUuid = response.data.guest_uuid;
                if (response.data.new_nonce) amlQuiz.nonce = response.data.new_nonce;
                $msg.removeClass('error').addClass('success').text('UPLINK ESTABLISHED. LOADING MISSION...').fadeIn();
                preloadGame();
                setTimeout(() => {
                    showRulesScreen();
                    $btn.prop('disabled', !1).text('ACCEPT MISSION & PLAY')
                }, 800)
            } else {
                $msg.removeClass('success').addClass('error').text('❌ ' + (response.data ? response.data.message : 'Error occurred')).fadeIn();
                $btn.prop('disabled', !1).text('ACCEPT MISSION & PLAY')
            }
        }).fail(function() {
            $msg.removeClass('success').addClass('error').text('❌ Network error. Please try again.').fadeIn();
            $btn.prop('disabled', !1).text('ACCEPT MISSION & PLAY')
        })
    }
    let preloadPromise = null;

    function preloadGame() {
        if (!gameState.guestUuid || gameState.preloadedData || gameState.isPreloading) {
            return preloadPromise
        }
        gameState.isPreloading = !0;
        let payload = {
            action: 'aml_quiz_start',
            nonce: amlQuiz.nonce,
            include_question: 1,
        };
        if (gameState.guestUuid && gameState.guestUuid !== 'returning_guest') {
            payload.guest_uuid = gameState.guestUuid
        }
        preloadPromise = $.post(amlQuiz.ajaxUrl, payload).then(function(response) {
            if (response.success) {
                gameState.preloadedData = response.data
            }
            gameState.isPreloading = !1;
            return response
        }).catch(function(error) {
            gameState.isPreloading = !1;
            return {
                success: !1,
                data: {
                    message: "Connection lost. Please refresh the page."
                }
            }
        });
        return preloadPromise
    }

    function showRulesScreen() {
        $('#welcome-screen, #guest-screen').fadeOut(300, function() {
            $(this).addClass('hidden');
            $('#rules-screen').removeClass('hidden').fadeIn(500)
        })
    }

    function launchGame() {
        localStorage.removeItem('aml_show_rules');
        $('#welcome-screen, #guest-screen, #rules-screen').fadeOut(500, function() {
            $(this).addClass('hidden');
            $('#game-ui').removeClass('hidden').hide().fadeIn(800);
            $('.game-container').addClass('game-active');
            if (sounds.bg) {
                sounds.bg.volume = 0.4;
                sounds.bg.play().catch(() => {})
            }
            const proceedToGame = (data) => {
                gameState.attemptId = data.attempt_id;
                gameState.gameStartTime = Date.now();
                if (data.first_question) {
                    displayQuestion(data.first_question);
                    playSound(sounds.load)
                } else {
                    loadNextQuestion()
                }
            };
            if (gameState.preloadedData) {
                proceedToGame(gameState.preloadedData)
            } else if (preloadPromise) {
                preloadPromise.then(response => {
                    if (response.success) proceedToGame(response.data);
                    else {
                        alert('Error: ' + response.data.message);
                        location.reload()
                    }
                })
            } else {
                preloadGame().then(response => {
                    if (response && response.success) proceedToGame(response.data);
                    else {
                        alert('Could not start quiz. Please refresh.');
                        location.reload()
                    }
                })
            }
        })
    }

    function loadNextQuestion() {
        $.post(amlQuiz.ajaxUrl, {
            action: 'aml_quiz_get_question',
            nonce: amlQuiz.nonce,
            attempt_id: gameState.attemptId,
        }, function(response) {
            if (response.success) {
                displayQuestion(response.data);
                playSound(sounds.load)
            }
        })
    }

    function displayQuestion(question) {
        gameState.currentQuestion = question;
        gameState.questionIndex = question.question_number - 1;
        $('#aml-question-text').text(question.question_text);
        const $grid = $('#aml-options-grid').empty();
        $.each(question.options, (key, val) => {
            const $btn = $('<div class="option-btn">').attr('data-answer', key);
            $btn.append('<span class="label">' + key + ':</span>');
            $btn.append('<span class="option-text">' + val + '</span>');
            $grid.append($btn)
        });
        updateSidebar();
        updateLifelines(question.lifelines_available);
        gameState.questionStartTime = Date.now();
        startQuestionTimer()
    }

    function updateSidebar() {
        const $ladder = $('#ladder-panel').empty();
        const qIndex = gameState.questionIndex;
        const currentBatch = Math.floor(qIndex / 10);
        const start = currentBatch * 10 + 1;
        const levels = ([
            [' AML Newbie', 'AML Pro'],
            ['AML Expert', 'AML Specialist']
        ][currentBatch]) || ['Cyber Agent', 'Elite Hunter'];
        const isTopActive = qIndex % 10 >= 5;
        $ladder.append($('<div class="level-header">').text(levels[1]).addClass(isTopActive ? 'active' : ''));
        for (let i = start + 9; i >= start + 5; i--) renderItem(i);
        const isBottomActive = qIndex % 10 < 5;
        const isBottomCompleted = qIndex % 10 >= 5;
        $ladder.append($('<div class="level-header">').text(levels[0]).addClass(isBottomActive ? 'active' : '').addClass(isBottomCompleted ? 'completed' : ''));
        for (let i = start + 4; i >= start; i--) renderItem(i);

        function renderItem(num) {
            const $item = $('<div class="question-item">');
            $item.append('<span class="q-number">' + num + '</span>');
            $item.append('<span class="q-text">Question</span>');
            if (num === qIndex + 1) $item.addClass('current');
            else if (num <= qIndex) $item.addClass('completed');
            $ladder.append($item)
        }
    }

    function startQuestionTimer() {
        clearInterval(gameState.timerInterval);
        gameState.timeLeft = parseInt(amlQuiz.timerPerQuestion) || 60;
        updateTimerDisplay();
        gameState.timerInterval = setInterval(() => {
            if (!gameState.timerPaused) {
                gameState.timeLeft--;
                updateTimerDisplay();
                if (gameState.timeLeft <= 0) {
                    clearInterval(gameState.timerInterval);
                    handleTimeout()
                }
            }
        }, 1000)
    }

    function updateTimerDisplay() {
        $('#aml-time-left').text(gameState.timeLeft);
        const $display = $('#timer-display').removeClass('timer-warning timer-critical');
        if (gameState.timeLeft <= 10 && gameState.timeLeft > 5) $display.addClass('timer-warning');
        else if (gameState.timeLeft <= 5) $display.addClass('timer-critical');
    }

    function handleTimeout() {
        playSound(sounds.wrong);
        $('.option-btn').addClass('disabled');
        submitAnswer('', amlQuiz.timerPerQuestion)
    }

    function selectOption(answer, $btn) {
        clearInterval(gameState.timerInterval);
        $('.option-btn').addClass('disabled');
        $btn.addClass('selected');
        playSound(sounds.start);
        const timeTaken = Math.floor((Date.now() - gameState.questionStartTime) / 1000);
        setTimeout(() => submitAnswer(answer, timeTaken, $btn), 1000)
    }

    function submitAnswer(answer, timeTaken, $btn) {
        $.post(amlQuiz.ajaxUrl, {
            action: 'aml_quiz_submit_answer',
            nonce: amlQuiz.nonce,
            attempt_id: gameState.attemptId,
            question_id: gameState.currentQuestion.question_id,
            answer: answer,
            time_taken: timeTaken,
        }, (response) => {
            if (response.success) handleResult(response.data, $btn);
        })
    }

    function handleResult(data, $btn) {
        $('.option-btn').removeClass('selected');
        $('.option-btn').each(function() {
            const isThisBtn = $btn && $(this).is($btn);
            if ($(this).attr('data-answer') === data.correct_answer) $(this).addClass('correct');
            if (!data.correct && isThisBtn) $(this).addClass('wrong');
        });
        playSound(data.correct ? sounds.correct : sounds.wrong);
        setTimeout(() => {
            if (data.game_status === 'completed') showVictory(data);
            else if (data.game_status === 'game_over') showGameOver(data);
            else loadNextQuestion()
        }, 2000)
    }

    function useLifeline(type, $btn) {
        if (gameState.lifelinesUsed[type]) return;
        gameState.lifelinesUsed[type] = !0;
        $btn.addClass('used').prop('disabled', !0);
        if (type === 'timer') gameState.timerPaused = !0;
        $.post(amlQuiz.ajaxUrl, {
            action: 'aml_quiz_use_lifeline',
            nonce: amlQuiz.nonce,
            attempt_id: gameState.attemptId,
            lifeline_type: type,
            question_id: gameState.currentQuestion.question_id,
        }, function(response) {
            if (response.success) {
                if (type === 'timer') {
                    let freezeRemaining = 30;
                    const $svg = $btn.find('svg').hide();
                    const $counter = $('<span class="lifeline-counter">').text(freezeRemaining).appendTo($btn);
                    const freezeInterval = setInterval(() => {
                        freezeRemaining--;
                        $counter.text(freezeRemaining);
                        if (freezeRemaining <= 0) {
                            clearInterval(freezeInterval);
                            gameState.timerPaused = !1;
                            $counter.remove();
                            $svg.show()
                        }
                    }, 1000)
                } else if (type === 'guru') {
                    gameState.timerPaused = !0;
                    $('#guru-hint-text').text(response.data.hint || 'Think about the fundamental principles of AML compliance.');
                    $('#guru-popup').removeClass('hidden').hide().fadeIn(300)
                }
            } else {
                revertLifelineUI(type, $btn);
                alert(response.data.message || 'Unable to use lifeline')
            }
        }).fail(function() {
            revertLifelineUI(type, $btn);
            alert('Network error. Please try again.')
        })
    }

    function revertLifelineUI(type, $btn) {
        gameState.lifelinesUsed[type] = !1;
        $btn.removeClass('used').prop('disabled', !1);
        if (type === 'timer') gameState.timerPaused = !1
    }

    function updateLifelines(available) {
        $('.aml-lifeline').each(function() {
            const type = $(this).data('lifeline');
            if (!available[type] || gameState.lifelinesUsed[type]) $(this).addClass('used').prop('disabled', !0);
            else $(this).removeClass('used').prop('disabled', !1)
        })
    }

    function showVictory(data) {
        const timeElapsed = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
        $('#victory-points').text(data.total_score);
        $('#victory-time').text(Math.floor(timeElapsed / 60) + ':' + (timeElapsed % 60).toString().padStart(2, '0'));
        $('.game-container').removeClass('game-active');
        $('#game-ui').addClass('hidden');
        $('#victory-screen').removeClass('hidden').fadeIn()
    }

    function showGameOver(data) {
        const timeElapsed = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
        $('#final-questions').text(gameState.questionIndex);
        $('#final-points').text(data.total_score);
        $('#final-time').text(Math.floor(timeElapsed / 60) + ':' + (timeElapsed % 60).toString().padStart(2, '0'));
        playSound(sounds.gameOver);
        $('.game-container').removeClass('game-active');
        $('#game-ui').addClass('hidden');
        $('#game-over-screen').removeClass('hidden').fadeIn();
        if (!gameState.lifelinesUsed.revival) {
            $('#revival-btn').removeClass('hidden').prop('disabled', !1)
        } else {
            $('#revival-btn').addClass('hidden')
        }
    }

    function handleRevival() {
        const $btn = $('#revival-btn');
        $btn.prop('disabled', !0).text('REVIVING...');
        $.post(amlQuiz.ajaxUrl, {
            action: 'aml_quiz_revive',
            nonce: amlQuiz.nonce,
            attempt_id: gameState.attemptId,
            question_id: gameState.currentQuestion ? gameState.currentQuestion.question_id : 0,
        }, function(response) {
            if (response.success) {
                gameState.lifelinesUsed.revival = !0;
                $('#revival-btn').addClass('hidden');
                $('#game-over-screen').fadeOut(300, function() {
                    $(this).addClass('hidden');
                    $('#game-ui').removeClass('hidden').fadeIn(300);
                    $('.game-container').addClass('game-active');
                    $('.option-btn').removeClass('disabled selected wrong correct').prop('disabled', !1);
                    playSound(sounds.start);
                    startQuestionTimer()
                })
            } else {
                alert('Revival Failed: ' + response.data.message);
                $btn.prop('disabled', !1).text('REVIVAL')
            }
        })
    }
    $(document).ready(initQuiz)
})(jQuery);