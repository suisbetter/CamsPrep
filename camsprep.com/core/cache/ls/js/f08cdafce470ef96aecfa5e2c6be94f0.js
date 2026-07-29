document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.cyber-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(tabItem => tabItem.classList.remove('active'));
            document.querySelectorAll('.cyber-tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const targetContent = document.getElementById('cyber-tab-content-' + tabId);
            if (targetContent) {
                targetContent.classList.add('active')
            }
        })
    })
});