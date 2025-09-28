// Handle clickable elements with specific functionality for portrait
document.querySelectorAll('.clickable').forEach(el => {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Portrait -> About page
    if (el.classList.contains('portrait')) {
      window.location.href = 'about.html';
      return;
    }

    // Navigate to Articles page on newspaper click
    if (el.classList.contains('newspaper')) {
      const isNightMode = document.body.classList.contains('night-mode');
      localStorage.setItem('nightMode', isNightMode);
      window.location.href = 'articles.html';
      return;
    }

    // Navigate to Certifications page on frame2 (certificate) click
    if (el.classList.contains('frame2')) {
      const isNightMode = document.body.classList.contains('night-mode');
      localStorage.setItem('nightMode', isNightMode);
      window.location.href = 'certifications.html';
      return;
    }

    // Navigate to Paintings page on easel click
    if (el.classList.contains('easel')) {
      window.location.href = 'paintings.html';
      return;
    }

    // Navigate to Projects page on table click
    if (el.classList.contains('table')) {
      window.location.href = 'projects.html';
      return;
    }

    // Open Resume in new tab on frame1 click
    if (el.classList.contains('frame1')) {
      window.open('https://drive.google.com/file/d/1yc1yW9tDQpjWLQwQaxhXBn1alOg0JCWP/view?usp=sharing', '_blank');
      return;
    }
    
    // Default: no alert
  });
});

function scaleRoom() {
  const room = document.querySelector('.room');
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  const rw = 1600;
  const rh = 900;
  const scale = Math.min(ww / rw, wh / rh);
  room.style.transform = `scale(${scale})`;
  room.style.position = 'absolute';
  room.style.left = `${(ww - rw * scale) / 2}px`;
  room.style.top = `${(wh - rh * scale) / 2}px`;
  // Reveal after first computed scale to prevent initial zoom flash
  if (room.style.opacity !== '1') {
    room.style.opacity = '1';
  }
}
window.addEventListener('resize', scaleRoom);

let manualMode = null; // null = auto, 'day' = force day, 'night' = force night
let userTimezone = null;
let timezoneDetected = false;
let currentTimeValues = { hours: 0, minutes: 0, seconds: 0 };
let detectedTimezone = null;

// Helper function to get current hour in VPN timezone
function getCurrentHour() {
  if (detectedTimezone) {
    try {
      const now = new Date();
      const options = { timeZone: detectedTimezone, hour: 'numeric', hour12: false };
      return parseInt(new Intl.DateTimeFormat('en-US', options).format(now));
    } catch (error) {
      console.log(`❌ Hour conversion failed: ${error.message}`);
      return new Date().getHours();
    }
  } else {
    return new Date().getHours();
  }
}
let teaBrewedCount = 0; // Will be loaded from global counter
// Use Netlify Function as the single source of truth
const TEA_API = '/.netlify/functions/tea';

async function loadTeaCount() {
  try {
    const res = await fetch(TEA_API, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.count === 'number') {
        // Never allow UI to decrease from a higher observed value
        teaBrewedCount = Math.max(teaBrewedCount || 0, data.count);
        updateCurrentTime();
        return;
      }
    }
  } catch (e) { console.log('Load tea count failed', e); }
}

async function incrementTea(by = 1) {
  try {
    // Optimistic UI
    teaBrewedCount += by;
    updateCurrentTime();

    const res = await fetch(`${TEA_API}?by=${by}`, { method: 'POST', cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.count === 'number') {
        // Avoid UI rollback if a stale response comes back
        teaBrewedCount = Math.max(teaBrewedCount || 0, data.count);
        updateCurrentTime();
      }
    }
  } catch (e) { console.log('Increment tea failed', e); }
}
let birdsAudio = null;
let nightAudio = null;
let isSoundMuted = localStorage.getItem('isSoundMuted') === 'true' || false;

// Global tea counter using browser storage with cross-tab sync
const STORAGE_KEY = 'global-tea-count';
const LAST_UPDATE_KEY = 'tea-last-update';

async function initGlobalTeaCount() {
  try {
    console.log('🔄 Loading global tea counter...');
    
    // Get stored count from localStorage (shared across all tabs/windows)
    const storedCount = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
    teaBrewedCount = storedCount;
    
    console.log(`✅ Loaded tea count: ${teaBrewedCount}`);
    saveTeaCount();
    updateCurrentTime();
    
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        const newCount = parseInt(e.newValue) || 0;
        if (newCount !== teaBrewedCount) {
          teaBrewedCount = newCount;
          console.log(`🔄 Tea count updated from another tab: ${teaBrewedCount}`);
          saveTeaCount();
          updateCurrentTime();
        }
      }
    });
    
  } catch (e) {
    console.log('Global tea counter init failed:', e.message);
    teaBrewedCount = 0;
    updateCurrentTime();
  }
}

async function incrementGlobalTeaCount() {
  try {
    console.log('🔄 Incrementing global tea counter...');
    
    // Increment the count
    teaBrewedCount++;
    
    // Update localStorage (this will trigger storage event in other tabs)
    localStorage.setItem(STORAGE_KEY, teaBrewedCount.toString());
    localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
    
    console.log(`✅ Global tea count updated: ${teaBrewedCount}`);
    saveTeaCount();
    updateCurrentTime();
    
  } catch (e) {
    console.log('Global increment failed:', e.message);
    teaBrewedCount++;
    saveTeaCount();
    updateCurrentTime();
  }
}

async function detectTimezone() {
  if (timezoneDetected) {
    console.log('Using cached timezone:', userTimezone);
    return userTimezone; // Return cached result (could be null for local time)
  }
  
  console.log('Attempting timezone detection...');
  try {
    const res = await fetch('https://ipapi.co/json/');
    console.log('API response status:', res.status);
    const data = await res.json();
    console.log('API response data:', data);
    if (data && data.timezone) {
      userTimezone = data.timezone;
      timezoneDetected = true;
      console.log('Timezone detected successfully:', userTimezone);
      return userTimezone;
    }
  } catch (e) {
    console.log('Timezone detection failed with error:', e);
  }
  
  // Mark as detected even if failed, so we don't keep trying every second
  timezoneDetected = true;
  userTimezone = null;
  console.log('Falling back to local browser time');
  return null;
}

function setGreeting() {
  const greeting = document.getElementById('greeting');
  const iconSpan = document.getElementById('greeting-icon');
  if (!greeting || !iconSpan) return;
  let hour = null;
  
  // Check if manual mode is active
  if (manualMode === 'day') {
    // For day mode, determine if it's morning or afternoon based on corrected time
    hour = getCurrentHour();
    // Ensure we're in day range, if not, default to morning
    if (hour < 5 || hour >= 20) {
      hour = 10; // Default to morning if somehow we're in night time
    }
  } else if (manualMode === 'night') {
    hour = 22; // Force night time
  } else {
    // Auto mode - get corrected timezone-aware time
    hour = getCurrentHour();
  }
  
  let text = '';
  let icon = '';
  if (hour >= 5 && hour < 12) {
    text = 'Good Morning!';
    icon = `<svg width="20" height="20" viewBox="0 0 219.786 219.786" fill="#7F6348" xmlns="http://www.w3.org/2000/svg"><g><path d="M109.881,183.46c-4.142,0-7.5,3.358-7.5,7.5v21.324c0,4.142,3.358,7.5,7.5,7.5c4.143,0,7.5-3.358,7.5-7.5V190.96C117.381,186.817,114.023,183.46,109.881,183.46z"></path><path d="M109.881,36.329c4.143,0,7.5-3.358,7.5-7.5V7.503c0-4.142-3.357-7.5-7.5-7.5c-4.142,0-7.5,3.358-7.5,7.5v21.326C102.381,32.971,105.739,36.329,109.881,36.329z"></path><path d="M47.269,161.909l-15.084,15.076c-2.93,2.928-2.931,7.677-0.003,10.606c1.465,1.465,3.385,2.198,5.305,2.198c1.919,0,3.837-0.732,5.302-2.195l15.084-15.076c2.93-2.928,2.931-7.677,0.003-10.606C54.946,158.982,50.198,158.982,47.269,161.909z"></path><path d="M167.208,60.067c1.919,0,3.838-0.732,5.303-2.196l15.082-15.076c2.929-2.929,2.93-7.677,0.002-10.607c-2.929-2.93-7.677-2.931-10.607-0.001l-15.082,15.076c-2.929,2.928-2.93,7.677-0.002,10.606C163.368,59.335,165.288,60.067,167.208,60.067z"></path><path d="M36.324,109.895c0-4.142-3.358-7.5-7.5-7.5H7.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.142,3.358,7.5,7.5,7.5h21.324C32.966,117.395,36.324,114.037,36.324,109.895z"></path><path d="M212.286,102.395h-21.334c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5h21.334c4.143,0,7.5-3.358,7.5-7.5C219.786,105.754,216.429,102.395,212.286,102.395z"></path><path d="M47.267,57.871c1.464,1.464,3.384,2.196,5.303,2.196c1.919,0,3.839-0.732,5.303-2.196c2.929-2.929,2.929-7.678,0-10.607L42.797,32.188c-2.929-2.929-7.678-2.929-10.606,0c-2.929,2.929-2.929,7.678,0,10.606L47.267,57.871z"></path><path d="M172.52,161.911c-2.929-2.929-7.678-2.93-10.607-0.001c-2.93,2.929-2.93,7.678-0.001,10.606l15.074,15.076c1.465,1.465,3.384,2.197,5.304,2.197c1.919,0,3.839-0.732,5.303-2.196c2.93-2.929,2.93-7.678,0.001-10.606L172.52,161.911z"></path><path d="M109.889,51.518c-32.187,0-58.373,26.188-58.373,58.377c0,32.188,26.186,58.375,58.373,58.375c32.19,0,58.378-26.187,58.378-58.375C168.267,77.706,142.078,51.518,109.889,51.518z M109.889,153.27c-23.916,0-43.373-19.458-43.373-43.375c0-23.918,19.457-43.377,43.373-43.377c23.919,0,43.378,19.459,43.378,43.377C153.267,133.812,133.812,153.27,109.889,153.27z"></path></g></svg>`;
  } else if (hour >= 12 && hour < 20) {
    text = 'Good Evening!';
    icon = `<svg width="20" height="20" viewBox="0 0 512 512" fill="#7F6348" xmlns="http://www.w3.org/2000/svg"><g><g><path d="m256 98.294c8.284 0 15-6.716 15-15v-68.294c0-8.284-6.716-15-15-15s-15 6.716-15 15v68.294c0 8.284 6.716 15 15 15z"></path><path d="m497 241h-68.294c-8.284 0-15 6.716-15 15s6.716 15 15 15h68.294c8.284 0 15-6.716 15-15s-6.716-15-15-15z"></path><path d="m98.294 256c0-8.284-6.716-15-15-15h-68.294c-8.284 0-15 6.716-15 15s6.716 15 15 15h68.294c8.284 0 15-6.716 15-15z"></path><path d="m395.924 131.91c3.838 0 7.678-1.465 10.606-4.394l36.853-36.852c5.858-5.857 5.858-15.355 0-21.213-5.856-5.858-15.354-5.858-21.213 0l-36.853 36.852c-5.858 5.857-5.858 15.355 0 21.213 2.929 2.929 6.768 4.394 10.607 4.394z"></path><path d="m105.469 127.516c2.929 2.929 6.768 4.394 10.606 4.394s7.678-1.464 10.606-4.394c5.858-5.858 5.858-15.355 0-21.213l-36.852-36.852c-5.857-5.858-15.355-5.858-21.213 0s-5.858 15.355 0 21.213z"></path><path d="m441.134 306.049h-65.698c6.608-15.765 10.063-32.755 10.063-50.049 0-71.406-58.093-129.5-129.499-129.5s-129.5 58.094-129.5 129.5c0 17.259 3.447 34.279 10.052 50.049h-65.686c-8.284 0-15 6.716-15 15s6.716 15 15 15h370.268c8.284 0 15-6.716 15-15s-6.716-15-15-15zm-284.634-50.049c0-54.864 44.636-99.5 99.5-99.5s99.499 44.635 99.499 99.5c0 17.658-4.667 34.9-13.504 50.049h-171.994c-8.829-15.132-13.501-32.423-13.501-50.049z"></path></g><path d="m350.229 364.614h-188.459c-8.284 0-15 6.716-15 15s6.716 15 15 15h188.46c8.284 0 15-6.716 15-15s-6.716-15-15.001-15z"></path></g></svg>`;
  } else {
    text = 'Good Night!';
    icon = `<svg width="20" height="20" viewBox="0 0 512 512" fill="#7F6348" xmlns="http://www.w3.org/2000/svg"><circle cx="467" cy="45" r="15"></circle><path d="m257 512c111.999 0 207.212-73.213 241.418-174.356 2.137-6.319-.155-13.289-5.625-17.106-5.471-3.817-12.803-3.564-17.997.622-32.341 26.063-71.345 39.84-112.796 39.84-99.804 0-181-80.748-181-180 0-61.371 32.685-120.091 85.3-153.243 5.643-3.556 8.26-10.41 6.423-16.822-1.802-6.289-7.464-10.67-13.974-10.862-.356-.027-.989-.073-1.749-.073-140.874 0-257 114.957-257 256 0 140.992 116.068 256 257 256zm-46.436-477.247c-38.416 39.855-59.564 92.385-59.564 146.247 0 115.794 94.654 210 211 210 30.463 0 60.542-6.738 87.993-19.419-40.087 67.52-112.846 110.419-192.993 110.419-125.168 0-227-101.383-227-226 0-108.781 77.585-199.856 180.564-221.247z"></path><path d="m287 120c24.392 0 45 21.065 45 46 0 8.284 6.716 15 15 15s15-6.716 15-15c0-24.935 20.607-46 45-46 8.284 0 15-6.716 15-15s-6.716-15-15-15c-24.813 0-45-20.187-45-45 0-8.284-6.716-15-15-15s-15 6.716-15 15c0 24.813-20.187 45-45 45-8.284 0-15 6.716-15 15s6.716 15 15 15zm60-30.052c4.331 5.766 9.472 10.891 15.253 15.203-5.783 4.409-10.865 9.568-15.253 15.48-4.387-5.911-9.468-11.069-15.253-15.48 5.782-4.312 10.922-9.437 15.253-15.203z"></path><circle cx="497" cy="166" r="15"></circle></svg>`;
  }
  iconSpan.innerHTML = icon;
  greeting.textContent = '';
  let i = 0;
  function typeGreeting() {
    if (i < text.length) {
      greeting.textContent += text[i];
      i++;
      setTimeout(typeGreeting, 60);
    }
  }
  typeGreeting();
}

async function detectTimezone() {
  const apis = [
    {
      url: 'https://ipapi.co/json/',
      parseTimezone: (data) => data.timezone,
      name: 'ipapi.co'
    },
    {
      url: 'http://ip-api.com/json/?fields=timezone',
      parseTimezone: (data) => data.timezone,
      name: 'ip-api.com'
    },
    {
      url: 'https://worldtimeapi.org/api/ip',
      parseTimezone: (data) => data.timezone,
      name: 'worldtimeapi.org'
    }
  ];
  
  for (let i = 0; i < apis.length; i++) {
    try {
      const api = apis[i];
      console.log(`🌐 Trying ${api.name} for VPN timezone detection...`);
      
      const response = await fetch(api.url, { 
        signal: AbortSignal.timeout(7000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const timezone = api.parseTimezone(data);
      
      if (timezone) {
        detectedTimezone = timezone;
        
        // Test the timezone to make sure it's valid
        try {
          const testTime = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).format(new Date());
          
          console.log(`✅ VPN timezone detected: ${timezone}`);
          console.log(`📍 Current VPN time: ${testTime}`);
          console.log(`🖥️ System time: ${new Date().toLocaleTimeString('en-US', { hour12: true })}`);
          
          return timezone;
        } catch (tzError) {
          console.log(`❌ Invalid timezone format: ${timezone}`);
          continue;
        }
      }
    } catch (error) {
      console.log(`❌ ${apis[i].name} failed:`, error.message);
    }
  }
  
  console.log('🔄 All VPN detection APIs failed, using system timezone');
  detectedTimezone = null;
  return null;
}

function updateCurrentTime() {
  const timeElement = document.getElementById('current-time');
  if (!timeElement) return;
  
  const now = new Date();
  let hours, minutes, seconds, timeString;
  
  if (detectedTimezone) {
    // Use VPN-detected timezone - get time directly in that timezone
    try {
      // Get time components in the detected timezone
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: detectedTimezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      
      const timeInTimezone = timeFormatter.format(now);
      const timeParts = timeInTimezone.split(':');
      hours = parseInt(timeParts[0]);
      minutes = parseInt(timeParts[1]);
      seconds = parseInt(timeParts[2]);
      
      // Get display string in the same timezone
      timeString = new Intl.DateTimeFormat('en-US', {
        timeZone: detectedTimezone,
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(now);
      
      console.log(`🌐 VPN Time (${detectedTimezone}): ${hours}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`);
      
    } catch (error) {
      console.log(`❌ Timezone conversion failed: ${error.message}`);
      // Fallback to system time
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
      timeString = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    }
  } else {
    // Use system time
    hours = now.getHours();
    minutes = now.getMinutes();
    seconds = now.getSeconds();
    timeString = now.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    console.log(`🖥️ System Time: ${hours}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`);
  }
  
  currentTimeValues = { hours, minutes, seconds };
  console.log(`📺 Display: ${timeString}`);
  
  // Use the same timeString variable
  
  // Add tea brewed count with icon to the time display
  const teaIcon = `<i class="tea-icon fi fi-rr-mug-hot-alt"></i>`;

  // Calculate commits counter (similar to original implementation)
  const commits = Math.floor(5000 + (Date.now() / 100000) % 1000);

  const displayText = `<span class="tea-count-text">${teaIcon}${teaBrewedCount} Tea brewed</span><br><span class="commits-count-text">${commits}+ commits pushed</span> · ${timeString}`;
  timeElement.innerHTML = displayText;
}

function animateTeaCount() {
  const teaCountElement = document.querySelector('.tea-count-text');
  const teaIconElement = document.querySelector('.tea-icon');
  if (!teaCountElement || !teaIconElement) return;
  
  // Completely reset to default state - remove all classes and inline styles
  teaCountElement.classList.remove('tea-count-animate');
  teaIconElement.className = 'tea-icon fi fi-rr-mug-hot-alt';
  teaIconElement.removeAttribute('style'); // Remove any inline styles
  
  // Force multiple reflows to ensure complete reset
  teaCountElement.offsetHeight;
  teaIconElement.offsetHeight;
  
  // Use requestAnimationFrame for consistent timing
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Change to solid icon
      teaIconElement.className = 'tea-icon fi fi-sr-mug-hot-alt';
      
      // Start animation on next frame to ensure icon change is rendered
      requestAnimationFrame(() => {
        teaCountElement.classList.add('tea-count-animate');
      });
    });
  });
  
  // Clean up after animation (1.2s animation + small buffer)
  setTimeout(() => {
    teaCountElement.classList.remove('tea-count-animate');
    teaIconElement.className = 'tea-icon fi fi-rr-mug-hot-alt';
    teaIconElement.removeAttribute('style'); // Ensure no leftover styles
  }, 1250);
}

function initializeToggle() {
  const modeSwitch = document.getElementById('mode-switch');
  if (!modeSwitch) return;
  
  // 1) Respect saved preference if available
  const savedPref = sessionStorage.getItem('nightMode');
  if (savedPref !== null) {
    const isNight = savedPref === 'true';
    modeSwitch.checked = isNight;
    manualMode = isNight ? 'night' : 'day';
    return; // updateGardenScene will apply classes later
  }

  // 2) Fallback to time-based init if no saved preference
  const hour = getCurrentHour();
  if (hour >= 20 || hour < 5) {
    modeSwitch.checked = true;
    manualMode = 'night';
  } else {
    modeSwitch.checked = false;
    manualMode = 'day';
  }
}

function saveTeaCount() {
  // Keep localStorage in sync for offline fallback, but don't use it as primary source
  localStorage.setItem('teaBrewedCount', teaBrewedCount.toString());
}

function updateClock() {
  // Use the time values that were calculated in updateCurrentTime
  let { hours, minutes, seconds } = currentTimeValues;
  
  // Don't update clock if we have invalid time data (like 0:0:0 from initialization)
  if (hours === 0 && minutes === 0 && seconds === 0) {
    console.log('Clock update skipped - invalid time data');
    return;
  }
  
  // Add fixed offset of +3 hours and 15 minutes to wall clock arrows only
  const CLOCK_OFFSET_HOURS = 3;
  const CLOCK_OFFSET_MINUTES = 15;
  
  // Apply the offset
  minutes += CLOCK_OFFSET_MINUTES;
  hours += CLOCK_OFFSET_HOURS;
  
  // Handle minute overflow
  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
  }
  
  // Handle hour overflow
  if (hours >= 24) {
    hours = hours % 24;
  }
  
  // For 12-hour clock display, convert 24-hour to 12-hour
  let displayHours = hours;
  if (displayHours > 12) {
    displayHours = displayHours - 12;
  } else if (displayHours === 0) {
    displayHours = 12;
  }
  
  // Calculate angles (360 degrees / 60 for minutes and seconds, 360 / 12 for hours)
  const secondAngle = (seconds * 6) - 90; // -90 to start from 12 o'clock
  const minuteAngle = (minutes * 6) - 90;
  
  // For hour angle calculation, use 0-11 range (convert 12 to 0 for proper positioning)
  const hourFor12ClockCalculation = displayHours === 12 ? 0 : displayHours;
  const hourAngle = (hourFor12ClockCalculation * 30) + (minutes * 0.5) - 90; // 0.5 for smooth hour movement
  
  console.log(`🕒 Clock Update: Original ${currentTimeValues.hours}:${String(currentTimeValues.minutes).padStart(2,'0')} -> Wall Clock ${hours}:${String(minutes).padStart(2,'0')} (+3h15m offset) -> 12h: ${displayHours}:${String(minutes).padStart(2,'0')} -> H:${hourAngle.toFixed(1)}° M:${minuteAngle}° S:${secondAngle}°`);
  
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

function updateGardenScene() {
  const gardenSky = document.getElementById('garden-sky');
  const sun = document.getElementById('sun');
  const moon = document.getElementById('moon');
  
  if (!gardenSky || !sun || !moon) return;
  
  // Use the same hour detection logic as the greeting
  let hour = null;
  
  if (manualMode === 'day') {
    hour = 10; // Force morning time
  } else if (manualMode === 'night') {
    hour = 22; // Force night time
  } else {
    // Auto mode - use corrected timezone
    hour = getCurrentHour();
  }
  
  // Clear all time classes
  gardenSky.classList.remove('morning', 'afternoon', 'night');
  sun.classList.remove('hidden');
  moon.classList.remove('visible');
  document.body.classList.remove('night-mode');
  
  // Apply time-based styling
  if (hour >= 5 && hour < 12) {
    // Morning (5 AM - 12 PM)
    gardenSky.classList.add('morning');
    sun.classList.remove('hidden');
    moon.classList.remove('visible');
  } else if (hour >= 12 && hour < 20) {
    // Afternoon (12 PM - 8 PM) 
    gardenSky.classList.add('afternoon');
    sun.classList.remove('hidden');
    moon.classList.remove('visible');
  } else {
    // Night (8 PM - 5 AM)
    gardenSky.classList.add('night');
    sun.classList.add('hidden');
    moon.classList.add('visible');
    document.body.classList.add('night-mode');
  }
  
  console.log(`Garden scene updated for hour ${hour}: ${gardenSky.className.split(' ').pop() || 'default'}`);
  
  // Update audio playback based on new mode
  updateAudioPlayback();
}

document.addEventListener('DOMContentLoaded', async function() {
  // If this load is a hard reload, clear the session preference so we fall back to timezone
  try {
    const nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null;
    const navType = nav ? nav.type : (performance.navigation && performance.navigation.type === 1 ? 'reload' : 'navigate');
    if (navType === 'reload') {
      sessionStorage.removeItem('nightMode');
    }
  } catch (e) {}
  console.log('🚀 Starting VPN-aware timezone detection...');
  
  // Try to detect VPN timezone
  await detectTimezone();
  
  console.log('⚙️ Initializing with timezone:', detectedTimezone || 'system');
  
  if (detectedTimezone) {
    console.log('✅ VPN timezone detected - all clocks will follow your VPN location');
    
    // Show comparison for verification
    const vpnTime = new Intl.DateTimeFormat('en-US', {
      timeZone: detectedTimezone,
      hour12: true,
      timeStyle: 'medium'
    }).format(new Date());
    const systemTime = new Date().toLocaleTimeString('en-US', { hour12: true });
    
    console.log(`📍 VPN Time: ${vpnTime}`);
    console.log(`🖥️ System Time: ${systemTime}`);
    
    if (vpnTime !== systemTime) {
      console.log('🔄 Time difference detected - VPN timezone will be used');
    }
  } else {
    console.log('⚠️ VPN timezone detection failed - using system time');
    console.log('💡 This means the time might not match your VPN location');
  }
  
  // Initialize everything with detected timezone
  initializeToggle();
  setGreeting();
  updateGardenScene();
  
  // Initialize global tea count before first render (fallback to local if it fails)
  await loadTeaCount();

  // Update time and clock immediately
  updateCurrentTime();
  updateClock();
  
  console.log('⏰ Starting synchronized time updates...');
  
  // Start regular updates (no more API calls needed)
  setInterval(() => {
    updateCurrentTime(); // Uses VPN timezone automatically
    updateClock(); // Both digital and analog use same time source
    updateGardenScene(); // Day/night based on VPN time
  }, 1000);
  // Existing scaling logic
  scaleRoom();
  // Phone click handler
  const phone = document.querySelector('.phone.clickable');
  if (phone) {
    phone.addEventListener('click', function(e) {
      e.stopPropagation();
      // Navigate to contact page (no persistence here; session is managed by toggle)
      window.location.href = 'contact.html';
    });
  }

  // Table click handler - navigate to projects page
  const table = document.querySelector('.table.clickable');
  if (table) {
    table.addEventListener('click', function(e) {
      e.stopPropagation();
      // Navigate to projects page (no persistence here)
      window.location.href = 'projects.html';
    });
  }
  
  // Mode toggle handler
  const modeSwitch = document.getElementById('mode-switch');
  if (modeSwitch) {
    modeSwitch.addEventListener('change', function() {
      if (this.checked) {
        manualMode = 'night';
      } else {
        manualMode = 'day';
      }
      // Persist preference during the session only
      sessionStorage.setItem('nightMode', (manualMode === 'night').toString());
      setGreeting();
      updateGardenScene(); // Update garden when mode changes
      updateAudioPlayback(); // Update audio based on new mode
    });
  }
  
  // Quote click handler
  const quote = document.querySelector('.quote.clickable');
  if (quote) {
    quote.addEventListener('click', function(e) {
      e.stopPropagation();
      // Quote functionality remains but no longer affects tea count
      alert('You clicked the Quote!');
    });
  }

  // Teapot click handler
  const teapot = document.querySelector('.teapot');
  if (teapot) {
    teapot.addEventListener('click', function(e) {
      e.stopPropagation();
      brewTea();
    });
  }

  // Initialize sound functionality
  initializeSound();

  // Initialize popup functionality
  initializePopup();

});

// Sound functionality
function initializeSound() {
  birdsAudio = document.getElementById('birds-audio');
  nightAudio = document.getElementById('night-audio');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  
  console.log('Initializing sound...');
  console.log('Birds audio element:', birdsAudio);
  console.log('Night audio element:', nightAudio);
  console.log('Sound toggle button:', soundToggleBtn);
  console.log('Is sound muted:', isSoundMuted);
  
  if (!birdsAudio) {
    console.error('Birds audio element not found!');
    return;
  }
  
  if (!nightAudio) {
    console.error('Night audio element not found!');
    return;
  }
  
  if (!soundToggleBtn) {
    console.error('Sound toggle button not found!');
    return;
  }
  
  // Set initial muted state
  updateSoundButton();
  
  // Add click event listener to sound toggle button
  soundToggleBtn.addEventListener('click', toggleSound);
  
  // Set audio volume for both
  birdsAudio.volume = 0.4; // Day sounds
  nightAudio.volume = 0.3; // Night sounds (slightly quieter)
  
  // Add audio event listeners for debugging
  birdsAudio.addEventListener('loadstart', () => console.log('Birds audio: Load started'));
  birdsAudio.addEventListener('canplay', () => console.log('Birds audio: Can play'));
  birdsAudio.addEventListener('play', () => console.log('Birds audio: Playing'));
  birdsAudio.addEventListener('pause', () => console.log('Birds audio: Paused'));
  birdsAudio.addEventListener('error', (e) => console.error('Birds audio error:', e));
  
  nightAudio.addEventListener('loadstart', () => console.log('Night audio: Load started'));
  nightAudio.addEventListener('canplay', () => console.log('Night audio: Can play'));
  nightAudio.addEventListener('play', () => console.log('Night audio: Playing'));
  nightAudio.addEventListener('pause', () => console.log('Night audio: Paused'));
  nightAudio.addEventListener('error', (e) => console.error('Night audio error:', e));
  
  // Try to load both audio files
  birdsAudio.load();
  nightAudio.load();
  
  // Initially start or stop audio based on mode and mute state
  setTimeout(() => {
    updateAudioPlayback();
  }, 1000); // Delay to ensure everything is loaded
}

function toggleSound() {
  console.log('Sound toggle clicked');
  isSoundMuted = !isSoundMuted;
  localStorage.setItem('isSoundMuted', isSoundMuted.toString());
  console.log('Sound muted state changed to:', isSoundMuted);
  updateSoundButton();
  updateAudioPlayback();
  
  // If unmuting, force a play attempt (user interaction allows autoplay)
  if (!isSoundMuted && birdsAudio && nightAudio) {
    const body = document.body;
    const isNightMode = body.classList.contains('night-mode');
    
    if (isNightMode) {
      console.log('Force playing night audio after user interaction...');
      nightAudio.play().then(() => {
        console.log('Manual night audio play successful');
      }).catch(e => {
        console.error('Manual night audio play failed:', e);
      });
    } else {
      console.log('Force playing birds audio after user interaction...');
      birdsAudio.play().then(() => {
        console.log('Manual birds audio play successful');
      }).catch(e => {
        console.error('Manual birds audio play failed:', e);
      });
    }
  }
}

function updateSoundButton() {
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  if (isSoundMuted) {
    soundToggleBtn.classList.add('muted');
  } else {
    soundToggleBtn.classList.remove('muted');
  }
}

function updateAudioPlayback() {
  if (!birdsAudio || !nightAudio) {
    console.log('Audio elements not available');
    return;
  }
  
  const body = document.body;
  const isNightMode = body.classList.contains('night-mode');
  
  if (isSoundMuted) {
    // Muted - stop all audio
    if (!birdsAudio.paused) {
      console.log('Muting birds audio');
      birdsAudio.pause();
    }
    if (!nightAudio.paused) {
      console.log('Muting night audio');
      nightAudio.pause();
    }
    return;
  }
  
  if (isNightMode) {
    // Night mode - play night sounds, stop birds
    if (!birdsAudio.paused) {
      console.log('Stopping birds audio for night mode');
      birdsAudio.pause();
    }
    
    if (nightAudio.readyState >= 2 && nightAudio.paused) {
      console.log('Starting night audio playback...');
      nightAudio.play().then(() => {
        console.log('Night audio started playing successfully');
      }).catch(e => {
        console.error('Night audio play failed:', e);
      });
    }
  } else {
    // Day mode - play birds, stop night sounds
    if (!nightAudio.paused) {
      console.log('Stopping night audio for day mode');
      nightAudio.pause();
    }
    
    if (birdsAudio.readyState >= 2 && birdsAudio.paused) {
      console.log('Starting birds audio playback...');
      birdsAudio.play().then(() => {
        console.log('Birds audio started playing successfully');
      }).catch(e => {
        console.error('Birds audio play failed:', e);
      });
    }
  }
}

// Teapot brewing animation
let isBrewingInProgress = false;

function brewTea() {
  // Prevent multiple animations from running simultaneously
  if (isBrewingInProgress) {
    return;
  }
  
  isBrewingInProgress = true;
  console.log('Starting tea brewing animation...');
  
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
      
      // Increment global counter first, then update UI with the result
      animateTeaCount();
      incrementTea(1);
      
      console.log('Tea brewing animation completed');
    }, 200);
    
      }, 2000);
}

// About Popup Functionality
function openAboutPopup() {
  const popup = document.getElementById('about-popup');
  if (popup) {
    popup.classList.add('active');
    // Prevent body scroll when popup is open
    document.body.style.overflow = 'hidden';
  }
}

function closeAboutPopup() {
  const popup = document.getElementById('about-popup');
  if (popup) {
    popup.classList.remove('active');
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

function initializePopup() {
  const popup = document.getElementById('about-popup');
  const closeBtn = document.getElementById('close-popup');
  
  if (!popup || !closeBtn) {
    console.error('Popup elements not found');
    return;
  }
  
  // Close popup when clicking the close button
  closeBtn.addEventListener('click', closeAboutPopup);
  
  // Close popup when clicking outside the popup container
  popup.addEventListener('click', function(e) {
    if (e.target === popup) {
      closeAboutPopup();
    }
  });
  
  // Close popup when pressing Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && popup.classList.contains('active')) {
      closeAboutPopup();
    }
  });
}

// Loader: fade out after all assets are fully loaded
window.addEventListener('load', function() {
  // Ensure final scaling after all images/fonts are ready
  try { scaleRoom(); } catch {}
  const loader = document.getElementById('loader');
  if (!loader) return;
  // Small delay to avoid abrupt flash
  setTimeout(() => {
    loader.classList.add('fade-out');
    const cleanup = () => loader && loader.remove();
    loader.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 900);
  }, 150);
});
