// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(30px)';
            
            // Trigger reflow
            void entry.target.offsetWidth;
            
            entry.target.style.animation = 'fadeUp 0.8s forwards cubic-bezier(0.2, 0.8, 0.2, 1)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.animationDelay = `${index * 0.1}s`;
    observer.observe(card);
});

// Parallax effect on mouse move for hero visual
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
    document.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
        heroVisual.style.transform = `translate(${xAxis}px, ${yAxis}px)`;
    });
}

// Demo Form Logic
const demoForm = document.getElementById('analyze-form');
const resultBox = document.getElementById('demo-result');

if (demoForm) {
    demoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const type = document.getElementById('analyze-type').value;
        const content = document.getElementById('analyze-content').value;
        
        // Show loading state
        resultBox.innerHTML = '<div class="spinner"></div><p style="margin-top: 1rem; color: var(--text-muted)">Analyzing with GuardianAI...</p>';
        
        try {
            const response = await fetch('/api/check-safety', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, content })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                const statusClass = data.is_safe ? 'status-safe' : 'status-unsafe';
                const icon = data.is_safe ? '✅ Safe' : '⚠️ Suspicious';
                
                resultBox.innerHTML = `
                    <div class="result-status ${statusClass}">${icon} (Score: ${data.score}/100)</div>
                    <p class="result-reason">${data.reason}</p>
                `;
            } else {
                resultBox.innerHTML = `<p class="placeholder-text" style="color: #EF4444">Error: ${data.error || 'Failed to analyze'}</p>`;
            }
        } catch (error) {
            resultBox.innerHTML = `<p class="placeholder-text" style="color: #EF4444">Connection Error: Could not reach the GuardianAI backend.</p>`;
        }
    });
}
