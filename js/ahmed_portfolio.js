// Ahmed's Custom Portfolio Interactions

// Scale room to fit screen
function scaleRoom() {
  const room = document.querySelector('.room');
  if (!room) {
    console.log('Room element not found!');
    return;
  }

  const ww = window.innerWidth;
  const wh = window.innerHeight;
  const rw = 1600;
  const rh = 900;
  const scale = Math.min(ww / rw, wh / rh);

  console.log(`Scaling room: ${scale} (${ww}x${wh} -> ${rw}x${rh})`);

  room.style.transform = `scale(${scale})`;
  room.style.position = 'absolute';
  room.style.left = `${(ww - rw * scale) / 2}px`;
  room.style.top = `${(wh - rh * scale) / 2}px`;

  // Make room visible after scaling
  room.style.opacity = '1';
  console.log('Room made visible');

  // Debug: check if images are loading
  const images = room.querySelectorAll('img');
  console.log(`Found ${images.length} images in room`);

  images.forEach((img, index) => {
    console.log(`Image ${index}: ${img.src} - loaded: ${img.complete}`);
    if (!img.complete) {
      img.onload = () => console.log(`Image ${index} loaded: ${img.src}`);
      img.onerror = () => console.log(`Image ${index} failed to load: ${img.src}`);
    }
  });
}

// Initialize room scaling
window.addEventListener('resize', scaleRoom);
window.addEventListener('load', scaleRoom);

// Wait for Sara's script to load first, then override specific click handlers
setTimeout(() => {
  // Override click handlers for navigation to our pages
  const portrait = document.querySelector('.portrait.clickable');
  if (portrait) {
    // Remove existing event listeners by cloning the element
    const newPortrait = portrait.cloneNode(true);
    portrait.parentNode.replaceChild(newPortrait, portrait);

    newPortrait.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Portrait clicked - navigating to about.html');
      window.location.href = 'about.html';
    });
  }

  const phone = document.querySelector('.phone.clickable');
  if (phone) {
    const newPhone = phone.cloneNode(true);
    phone.parentNode.replaceChild(newPhone, phone);

    newPhone.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Phone clicked - navigating to contact.html');
      window.location.href = 'contact.html';
    });
  }

  const newspaper = document.querySelector('.newspaper.clickable');
  if (newspaper) {
    const newNewspaper = newspaper.cloneNode(true);
    newspaper.parentNode.replaceChild(newNewspaper, newspaper);

    newNewspaper.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Newspaper clicked - navigating to articles.html');
      window.location.href = 'articles.html';
    });
  }

  const frame2 = document.querySelector('.frame2.clickable');
  if (frame2) {
    const newFrame2 = frame2.cloneNode(true);
    frame2.parentNode.replaceChild(newFrame2, frame2);

    newFrame2.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Frame2 clicked - navigating to certifications.html');
      window.location.href = 'certifications.html';
    });
  }

  const easel = document.querySelector('.easel.clickable');
  if (easel) {
    const newEasel = easel.cloneNode(true);
    easel.parentNode.replaceChild(newEasel, easel);

    newEasel.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Easel clicked - navigating to paintings.html');
      window.location.href = 'paintings.html';
    });
  }

  const table = document.querySelector('.table.clickable');
  if (table) {
    const newTable = table.cloneNode(true);
    table.parentNode.replaceChild(newTable, table);

    newTable.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Table clicked - navigating to projects.html');
      window.location.href = 'projects.html';
    });
  }

  const frame1 = document.querySelector('.frame1.clickable');
  if (frame1) {
    const newFrame1 = frame1.cloneNode(true);
    frame1.parentNode.replaceChild(newFrame1, frame1);

    newFrame1.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Frame1 clicked - navigating to about.html');
      window.location.href = 'about.html';
    });
  }
}, 1000);

function showProjectsInfo() {
  const projects = `
Featured Projects:

🚚 Transflo Mobile+
• Logistics platform with $115B+ freight annually
• 3.2M+ downloads
• Migrated from Java/MVC to Kotlin/MVI

🏥 Vezeeta Patient
• Healthcare booking platform in 5+ countries
• 1M+ downloads
• Launched telehealth during COVID-19

💰 AevaPay
• Cryptocurrency payment app for POS
• Kotlin + Jetpack Compose + MVVM

📚 Kotobi by Vodafone
• Digital reading platform for Arabic books
• 500K+ downloads
• 10,000+ books and 30+ periodicals
  `;
  alert(projects);
}

function showQuote() {
  const quotes = [
    "Code is like humor. When you have to explain it, it's bad.",
    "First, solve the problem. Then, write the code.",
    "The best error message is the one that never shows up.",
    "Clean code always looks like it was written by someone who cares.",
    "Android development: Where every pixel matters and every millisecond counts."
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  alert(randomQuote);
}

// Update the welcome message periodically
function updateWelcomeMessage() {
  const welcomeMsg = document.querySelector('.welcome-msg');
  if (welcomeMsg) {
    const messages = [
      "Welcome to the digital space of a Senior Android Engineer",
      "Building Android apps that millions of users love",
      "Kotlin • Jetpack Compose • Clean Architecture",
      "6+ years of mobile excellence"
    ];

    let currentIndex = 0;
    setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      welcomeMsg.textContent = messages[currentIndex];
    }, 4000);
  }
}

// Don't override the tea counter - let Sara's script handle it
// The original script already implements "Tea brewed" counter correctly

// About Popup Functionality
function openAboutPopup() {
  const popup = document.getElementById('about-popup');
  if (popup) {
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAboutPopup() {
  const popup = document.getElementById('about-popup');
  if (popup) {
    popup.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Update live time and clock
function updateLiveTime() {
  const liveTimeElement = document.getElementById('live-time');
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  if (liveTimeElement) {
    liveTimeElement.textContent = timeString;
  }

  // Update analog clock
  updateClock();
}

// Update analog clock hands
function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Calculate angles
  const secondAngle = (seconds * 6) - 90; // -90 to start from 12 o'clock
  const minuteAngle = (minutes * 6) - 90;
  const hourAngle = ((hours % 12) * 30) + (minutes * 0.5) - 90; // 0.5 for smooth hour movement

  // Apply rotations
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');

  if (hourHand) {
    hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
  }

  if (minuteHand) {
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
  }

  if (secondHand) {
    secondHand.style.transform = `translateX(-50%) rotate(${secondAngle}deg)`;
  }
}

// Initialize day/night mode toggle
function initializeModeToggle() {
  const modeSwitch = document.getElementById('mode-switch');
  if (!modeSwitch) return;

  // Set initial mode based on time
  const hour = new Date().getHours();
  const isNightTime = hour >= 20 || hour < 6;

  modeSwitch.checked = isNightTime;
  updateMode(isNightTime);

  // Add event listener
  modeSwitch.addEventListener('change', function() {
    updateMode(this.checked);
  });
}

function updateMode(isNight) {
  document.body.classList.toggle('night-mode', isNight);

  // Update greeting
  const greeting = document.getElementById('greeting');
  if (greeting) {
    if (isNight) {
      greeting.textContent = 'Good Night!';
    } else {
      const hour = new Date().getHours();
      if (hour < 12) {
        greeting.textContent = 'Good Morning!';
      } else {
        greeting.textContent = 'Good Evening!';
      }
    }
  }
}

// Teapot brewing animation functionality
let isBrewingInProgress = false;

function brewTea() {
  // Prevent multiple animations from running simultaneously
  if (isBrewingInProgress) {
    return;
  }

  isBrewingInProgress = true;
  console.log('🫖 Starting tea brewing animation...');

  const teapot = document.querySelector('.teapot');
  const teapotSteam = document.querySelector('.teapot-steam');
  const teaPour = document.querySelector('.tea-pour');

  if (!teapot || !teapotSteam || !teaPour) {
    console.error('Teapot elements not found');
    isBrewingInProgress = false;
    return;
  }

  // Phase 1: Start brewing animation (teapot rises and rotates)
  teapot.classList.add('brewing');

  // Phase 2: After 200ms, add steam effect
  setTimeout(() => {
    teapotSteam.classList.add('active');
  }, 200);

  // Phase 3: After 800ms, add tea pouring effect
  setTimeout(() => {
    teaPour.classList.add('active');
  }, 800);

  // Phase 4: After 2 seconds, start returning to normal
  setTimeout(() => {
    // Remove tea pouring first
    teaPour.classList.remove('active');

    // Remove steam after 500ms
    setTimeout(() => {
      teapotSteam.classList.remove('active');
    }, 500);

    // Return teapot to normal position after 200ms
    setTimeout(() => {
      teapot.classList.remove('brewing');
      isBrewingInProgress = false;

      // Animate tea counter
      animateTeaCounter();

      console.log('🫖 Tea brewing animation completed');
    }, 200);

  }, 2000);
}

function animateTeaCounter() {
  const teaElement = document.querySelector('.tea-count-text');
  const commitsElement = document.querySelector('.commits-count-text');

  if (teaElement) {
    // Add animation class to tea counter
    teaElement.style.transform = 'scale(1.1)';
    teaElement.style.transition = 'all 0.3s ease';

    // Return to normal size
    setTimeout(() => {
      teaElement.style.transform = 'scale(1)';
    }, 300);
  }

  if (commitsElement) {
    // Add animation class to commits counter
    commitsElement.style.transform = 'scale(1.1)';
    commitsElement.style.transition = 'all 0.3s ease';

    // Update the commits counter when tea is brewed
    const currentText = commitsElement.innerHTML;
    const match = currentText.match(/(\d+)\+/);
    if (match) {
      const currentCount = parseInt(match[1]);
      const newCount = currentCount + 1;
      commitsElement.innerHTML = currentText.replace(/\d+\+/, newCount + '+');
    }

    // Return to normal size
    setTimeout(() => {
      commitsElement.style.transform = 'scale(1)';
    }, 300);
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Scale room immediately
  scaleRoom();

  // Initialize popup functionality
  const popup = document.getElementById('about-popup');
  const closeBtn = document.getElementById('close-popup');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeAboutPopup);
  }

  if (popup) {
    popup.addEventListener('click', function(e) {
      if (e.target === popup) {
        closeAboutPopup();
      }
    });
  }

  // Close popup with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && popup && popup.classList.contains('active')) {
      closeAboutPopup();
    }
  });

  // Initialize mode toggle
  initializeModeToggle();

  // Start the welcome message rotation
  updateWelcomeMessage();

  // Update live time every second
  setInterval(updateLiveTime, 1000);
  updateLiveTime(); // Initial call

  // Tea counter is handled by Sara's original script

  // Add teapot click handler
  const teapot = document.querySelector('.teapot');
  if (teapot) {
    teapot.addEventListener('click', function(e) {
      e.stopPropagation();
      brewTea();
    });
  }

  // Force scale room after a brief delay to ensure CSS is loaded
  setTimeout(() => {
    scaleRoom();
  }, 100);
});

// Allow Sara's script to handle the complex animations and teapot functionality
// Our script focuses on navigation and basic room setup