document.addEventListener('DOMContentLoaded', () => {

    // 1. Smooth Elegant Scroll Reveal (Apple Style)
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));

    // 2. High-End Apple Mouse Parallax (Restrained 3D Tilt)
    // We keep the tilt very subtle, to feel premium, heavy, and deliberate.
    const interactivePanels = document.querySelectorAll('.interactive-element');
    const subtlePanels = document.querySelectorAll('.interactive-element-subtle');
    const imagePanels = document.querySelectorAll('.interactive-element-image');

    const applyTilt = (elements, intensity) => {
        elements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Very subtle rotation (max 4 degrees vs 15 degrees previously) to mimic premium floating UI
                const xRotation = -((y - rect.height / 2) / rect.height) * intensity; 
                const yRotation = ((x - rect.width / 2) / rect.width) * intensity;
                
                el.style.transform = `perspective(1200px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale3d(1.01, 1.01, 1.01)`;
                el.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.12)';
            });

            el.addEventListener('mouseleave', () => {
                // Reset with a smooth, slow spring-like transition
                el.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                el.style.boxShadow = 'var(--shadow-glass)'; // Return to standard glass shadow CSS var
            });
        });
    };

    // Apply different tilt intensities based on element importance
    applyTilt(interactivePanels, 4); // Standard subtle tilt for main cards
    applyTilt(subtlePanels, 2);     // Even softer tilt for trust bars
    applyTilt(imagePanels, 2.5);   // Soft tilt for framed image photography

    // 3. Header Minimize on Scroll
    const header = document.querySelector('.header-main');
    
    window.addEventListener('scroll', () => {
        if(window.scrollY > 60) {
            header.style.background = 'rgba(255, 255, 255, 0.85)';
            header.style.padding = '0.4rem 0';
            header.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'var(--glass-bg-light)';
            header.style.padding = '0.8rem 0';
            header.style.boxShadow = 'var(--shadow-glass)';
        }
    });

    // --- Mobile Navigation Logic ---
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navWrapper = document.querySelector('.nav-wrapper');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    if (mobileToggle && navWrapper) {
        mobileToggle.addEventListener('click', () => {
            navWrapper.classList.toggle('active');
        });
    }

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                toggle.parentElement.classList.toggle('active');
            }
        });
    });

    // --- Calculators Logic ---

    // 1. EMI Calculator
    const calculateEmiBtn = document.getElementById('calculateEmiBtn');
    if (calculateEmiBtn) {
        const loanAmount = document.getElementById('loanAmount');
        const interestRate = document.getElementById('interestRate');
        const loanTenure = document.getElementById('loanTenure');
        const amountDisplay = document.getElementById('amountDisplay');
        const interestDisplay = document.getElementById('interestDisplay');
        const tenureDisplay = document.getElementById('tenureDisplay');
        
        const emiResult = document.getElementById('emiResult');
        const totalInterestResult = document.getElementById('totalInterestResult');
        const totalPaid = document.getElementById('totalPaid');
        let emiChart;

        loanAmount.oninput = () => amountDisplay.textContent = Number(loanAmount.value).toLocaleString();
        interestRate.oninput = () => interestDisplay.textContent = interestRate.value;
        loanTenure.oninput = () => tenureDisplay.textContent = loanTenure.value;

        calculateEmiBtn.addEventListener('click', () => {
            fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(loanAmount.value),
                    interest: parseFloat(interestRate.value),
                    years: parseInt(loanTenure.value)
                })
            })
            .then(res => res.json())
            .then(data => {
                emiResult.textContent = data.emi.toFixed(2);
                totalInterestResult.textContent = data.total_interest.toFixed(2);
                totalPaid.textContent = data.total_payment.toFixed(2);

                if (emiChart) emiChart.destroy();
                const ctx = document.getElementById('emiLoanChart').getContext('2d');
                emiChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Principal', 'Total Interest'],
                        datasets: [{
                            data: [data.principal, data.total_interest],
                            backgroundColor: ['#0A2540', '#C5A059'],
                            borderWidth: 0
                        }]
                    },
                    options: { responsive: true, cutout: '70%', plugins: { legend: { position: 'bottom'} } }
                });
            })
            .catch(err => console.error(err));
        });
    }

    // 2. SIP Calculator
    const calculateSipBtn = document.getElementById('calculateSipBtn');
    if (calculateSipBtn) {
        const syncSip = (sliderId, numId) => {
            const slider = document.getElementById(sliderId);
            const num = document.getElementById(numId);
            slider.addEventListener('input', () => num.value = slider.value);
            num.addEventListener('input', () => slider.value = num.value);
        };
        syncSip('sipInvestment', 'sipInvestmentNum');
        syncSip('sipRate', 'sipRateNum');
        syncSip('sipYears', 'sipYearsNum');

        let sipChart;

        calculateSipBtn.addEventListener('click', () => {
            const investment = parseFloat(document.getElementById('sipInvestmentNum').value);
            const rate = parseFloat(document.getElementById('sipRateNum').value);
            const years = parseInt(document.getElementById('sipYearsNum').value);

            fetch('/sip-calc/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ investment, rate, years })
            })
            .then(res => res.json())
            .then(data => {
                document.getElementById('sipInvestedResult').textContent = data.invested;
                document.getElementById('sipReturnsResult').textContent = data.returns;
                document.getElementById('sipTotalResult').textContent = data.total;

                if (sipChart) sipChart.destroy();
                const ctx = document.getElementById('sipChart').getContext('2d');
                sipChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Invested Amount', 'Estimated Returns'],
                        datasets: [{
                            data: [data.invested, data.returns],
                            backgroundColor: ['#0A2540', '#C5A059'],
                            borderWidth: 0
                        }]
                    },
                    options: { responsive: true, cutout: '70%', plugins: { legend: { position: 'bottom'} } }
                });
            })
            .catch(err => console.error(err));
        });
    }

    // 3. Loan Form Submission Simulate
    const submitLoanBtn = document.getElementById('submitLoanBtn');
    if (submitLoanBtn) {
                submitLoanBtn.addEventListener('click', () => {
            const form = document.getElementById('loanForm');
            if (form.checkValidity()) {
                const name = document.getElementById('loanName').value;
                const contact = document.getElementById('loanContact').value;
                const uid = document.getElementById('loanUid').value;
                const loanType = document.getElementById('loanType').value;
                const employment = document.getElementById('loanEmployment').value;

                fetch('/api/submit-loan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, contact, uid, loanType, employment })
                })
                .then(res => res.json())
                .then(data => {
                    const statusDiv = document.getElementById('loanStatusMessage');
                    statusDiv.style.display = 'block';
                    
                    if (data.error) {
                        statusDiv.style.color = '#ff6b6b';
                        statusDiv.textContent = data.error;
                        return; // do not reset form
                    }
                    
                    statusDiv.style.color = '#d4af37';
                    statusDiv.textContent = data.message;
                    setTimeout(() => {
                        form.reset();
                        statusDiv.style.display = 'none';
                    }, 5000);
                })
                .catch(() => {
                    const statusDiv = document.getElementById('loanStatusMessage');
                    statusDiv.style.display = 'block';
                    statusDiv.style.color = '#ff6b6b';
                    statusDiv.textContent = 'Error submitting form. The backend might be unreachable.';
                });
            } else {
                form.reportValidity();
            }
        });
    }

});
