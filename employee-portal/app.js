// ==========================================================================
// BACKEND API CONFIG
// ==========================================================================
const API_BASE = "http://localhost:8000/portal";

// ==========================================================================
// DEADLINE DATE HELPERS
// ==========================================================================
function getOneWeekDeadline() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

function formatDeadlineDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  
  const diffTime = d - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  if (diffDays === 0) return `Today`;
  if (diffDays === 1) return `Tomorrow`;
  if (diffDays < 0) return `Overdue (${Math.abs(diffDays)}d ago)`;
  return `${formattedDate} (in ${diffDays} days)`;
}

// ==========================================================================
// COURSE DATABASE & SYLLABUS DATA (LOADED DYNAMICALLY)
// ==========================================================================
let COURSES_DB = [];

// ==========================================================================
// INITIAL USERS & DEFAULT SYSTEM STATE (LOADED DYNAMICALLY)
// ==========================================================================
let DEFAULT_STATE = {
  currentUser: "employee_1",
  users: {},
  assignments: {}
};

async function loadExternalData() {
  const [coursesRes, usersRes, assignmentsRes] = await Promise.all([
    fetch(`${API_BASE}/courses`),
    fetch(`${API_BASE}/users`),
    fetch(`${API_BASE}/assignments`),
  ]);

  if (!coursesRes.ok || !usersRes.ok || !assignmentsRes.ok) {
    throw new Error("One or more static data files failed to load from 'data/' directory.");
  }

  COURSES_DB = await coursesRes.json();
  const users = await usersRes.json();
  const assignments = await assignmentsRes.json();

  // Convert deadlines from placeholder "DUE_IN_ONE_WEEK" to actual relative dates
  Object.keys(assignments).forEach(userId => {
    assignments[userId].forEach(assign => {
      if (assign.deadline === "DUE_IN_ONE_WEEK") {
        assign.deadline = getOneWeekDeadline();
      }
    });
  });

  DEFAULT_STATE.users = users;
  DEFAULT_STATE.assignments = assignments;
}

let state = {};

// ==========================================================================
// CENTRAL STATE CONTROLLER & LIFECYCLE
// ==========================================================================
async function initApp() {
  try {
    await loadExternalData();
  } catch (err) {
    console.warn("Could not load external backend data. Falling back to empty state:", err);
    COURSES_DB = [];
    DEFAULT_STATE = {
      currentUser: "",
      users: {},
      assignments: {}
    };
  }
  loadState();
  populateUserDropdown();
  setupEventListeners();
  renderApp();
}

function populateUserDropdown() {
  const profileSelect = document.getElementById("user-profile-select");
  if (!profileSelect) return;

  profileSelect.innerHTML = "";
  const userIds = Object.keys(state.users || {});
  if (userIds.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "N/A";
    profileSelect.appendChild(opt);
    return;
  }

  userIds.forEach(userId => {
    const user = state.users[userId];
    const opt = document.createElement("option");
    opt.value = userId;
    const dept = user.department || (user.role.includes("Engineer") ? "Engineering" : user.role.includes("Designer") ? "Design" : "QA Team");
    opt.textContent = `${user.name} (${dept})`;
    profileSelect.appendChild(opt);
  });
}

function loadState() {
  const cached = localStorage.getItem("aerolearn_state");
  if (cached) {
    try {
      state = JSON.parse(cached);
      
      // Safeguard: Initialize missing root objects
      if (!state.users) {
        state.users = {};
      }
      if (!state.assignments) {
        state.assignments = {};
      }

      // Merge missing users from DEFAULT_STATE
      Object.keys(DEFAULT_STATE.users).forEach(userId => {
        if (!state.users[userId]) {
          state.users[userId] = DEFAULT_STATE.users[userId];
        }
      });

      // Merge missing assignments from DEFAULT_STATE
      Object.keys(DEFAULT_STATE.assignments).forEach(userId => {
        if (!state.assignments[userId]) {
          state.assignments[userId] = JSON.parse(JSON.stringify(DEFAULT_STATE.assignments[userId]));
        }
      });

      // Ensure current user is valid
      if (!state.currentUser || !state.users[state.currentUser]) {
        state.currentUser = DEFAULT_STATE.currentUser;
      }

      // Migration safeguard: make sure deadlines exist on loaded ongoing courses
      Object.keys(state.assignments).forEach(userId => {
        state.assignments[userId].forEach(assign => {
          if (assign.progress < 100 && !assign.deadline) {
            assign.deadline = getOneWeekDeadline();
          }
        });
      });

      saveState(); // Commit migrations immediately to localStorage
    } catch(e) {
      console.error("Error migrating cached state:", e);
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
    }
  } else {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
  }
}

function saveState() {
  localStorage.setItem("aerolearn_state", JSON.stringify(state));
}

// Navigation & Navigation Tracking variables
let currentCourseId = null;
let currentLessonId = null;
let selectedQuizAnswer = null;

// ==========================================================================
// REGISTRATION OF INTERACTIVE EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
  // Switcher dropdown profiles
  const profileSelect = document.getElementById("user-profile-select");
  if (profileSelect) {
    profileSelect.value = state.currentUser || "";
    profileSelect.addEventListener("change", (e) => {
      try {
        state.currentUser = e.target.value;
        saveState();
        // Reset view variables
        currentCourseId = null;
        currentLessonId = null;
        // Render
        renderApp();
      } catch (err) {
        console.error("Error switching profile:", err);
        alert("Failed to switch profile: " + err.message);
      }
    });
  }

  // Course Viewer back btn
  const backBtn = document.getElementById("viewer-back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "home.html";
    });
  }

  // Course Player navigation control buttons
  const prevBtn = document.getElementById("prev-lesson-btn");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => navigateLesson(-1));
  }
  
  const nextBtn = document.getElementById("next-lesson-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => navigateLesson(1));
  }
  
  const completeBtn = document.getElementById("complete-lesson-btn");
  if (completeBtn) {
    completeBtn.addEventListener("click", toggleLessonCompletion);
  }
}

// ==========================================================================
// RENDER DRIVER ENGINE
// ==========================================================================
function renderApp() {
  const currentUserObj = (state.currentUser && state.users && state.users[state.currentUser])
    ? state.users[state.currentUser]
    : { name: "N/A", role: "N/A", avatar: "N/A" };
  
  // Update header text welcome & details
  const welcomeTitle = document.getElementById("welcome-title");
  if (welcomeTitle) {
    const welcomeName = currentUserObj.name !== "N/A" ? currentUserObj.name.split(' ')[0] : "Guest";
    welcomeTitle.textContent = `Welcome back, ${welcomeName}!`;
  }

  const sidebarUsername = document.getElementById("sidebar-username");
  if (sidebarUsername) sidebarUsername.textContent = currentUserObj.name;

  const sidebarRole = document.getElementById("sidebar-role");
  if (sidebarRole) sidebarRole.textContent = currentUserObj.role;

  const sidebarAvatar = document.getElementById("sidebar-avatar");
  if (sidebarAvatar) sidebarAvatar.textContent = currentUserObj.avatar;

  const headerAvatar = document.getElementById("header-avatar");
  if (headerAvatar) headerAvatar.textContent = currentUserObj.avatar;
  
  // Sync profile switcher dropdown value
  const profileSelect = document.getElementById("user-profile-select");
  if (profileSelect) {
    profileSelect.value = state.currentUser || "";
  }

  // Format today's date
  const currentDate = document.getElementById("current-date");
  if (currentDate) {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    currentDate.textContent = new Date().toLocaleDateString('en-US', options);
  }

  // Compute overall progress metrics
  const userAssignments = (state.currentUser && state.assignments) ? (state.assignments[state.currentUser] || []) : [];
  const totalAssigned = userAssignments.length;
  const completedCount = userAssignments.filter(a => a.progress === 100).length;
  
  let averageProgress = 0;
  if (totalAssigned > 0) {
    const totalProgress = userAssignments.reduce((acc, curr) => acc + curr.progress, 0);
    averageProgress = Math.round(totalProgress / totalAssigned);
  }

  // Inject metrics into DOM
  const statAssigned = document.getElementById("stat-assigned-count");
  if (statAssigned) statAssigned.textContent = totalAssigned > 0 ? totalAssigned : "N/A";

  const statCompleted = document.getElementById("stat-completed-count");
  if (statCompleted) statCompleted.textContent = totalAssigned > 0 ? completedCount : "N/A";

  const statAvg = document.getElementById("stat-avg-progress");
  if (statAvg) statAvg.textContent = totalAssigned > 0 ? `${averageProgress}%` : "N/A";

  // Check current page pathname
  const path = window.location.pathname.toLowerCase();

  if (path.includes("home.html") || path.includes("index.html") || path === "/" || path.endsWith("/")) {
    renderDashboard();
  } else if (path.includes("mandatory.html")) {
    renderMandatory();
  } else if (path.includes("skills.html")) {
    renderSkills();
  } else if (path.includes("viewer.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    if (courseId) {
      openCourseViewer(courseId);
    } else {
      window.location.href = "home.html";
    }
  }
}

// ==========================================================================
// DASHBOARD PORTLET DRAW (NEW & ONGOING CODES ACROSS ALL TYPES)
// ==========================================================================
function renderDashboard() {
  const newlyAssignedContainer = document.getElementById("newly-assigned-list");
  const ongoingGrid = document.getElementById("ongoing-courses-grid");
  const newCountIndicator = document.getElementById("new-courses-count");

  newlyAssignedContainer.innerHTML = "";
  ongoingGrid.innerHTML = "";

  const assignments = (state.currentUser && state.assignments) ? (state.assignments[state.currentUser] || []) : [];
  
  const newAssignments = [];
  const ongoingAssignments = [];

  assignments.forEach(assign => {
    const courseObj = COURSES_DB.find(c => c.id === assign.courseId);
    if (!courseObj) return;

    if (assign.progress === 0) {
      newAssignments.push({ assign, courseObj });
    } else if (assign.progress < 100) {
      ongoingAssignments.push({ assign, courseObj });
    }
  });

  const isEmptyDB = COURSES_DB.length === 0;

  // 1. Render Newly Assigned Section
  if (isEmptyDB) {
    newCountIndicator.textContent = "0 New";
    newCountIndicator.style.display = "none";
    newlyAssignedContainer.innerHTML = `
      <div class="glass-card" style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
        No data currently
      </div>
    `;
  } else if (newAssignments.length === 0) {
    newCountIndicator.textContent = "0 New";
    newCountIndicator.style.display = "none";
    newlyAssignedContainer.innerHTML = `
      <div class="glass-card" style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
        No newly assigned courses. Great job keeping up to date!
      </div>
    `;
  } else {
    newCountIndicator.style.display = "inline-block";
    newCountIndicator.textContent = `${newAssignments.length} New`;
    
    newAssignments.forEach(({ assign, courseObj }) => {
      const row = document.createElement("div");
      row.className = "new-course-strip";
      
      const deadlineText = assign.deadline ? `Due by ${formatDeadlineDate(assign.deadline)}` : 'No deadline';
      
      row.innerHTML = `
        <div class="new-course-details">
          <div class="new-course-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div class="new-course-meta">
            <h3>${courseObj.title}</h3>
            <div class="meta-tags">
              <span class="meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${courseObj.duration}
              </span>
              <span class="meta-item">•</span>
              <span class="meta-item" style="color: #f59e0b; font-weight: 500;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; margin-right: 2px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${deadlineText}
              </span>
              <span class="meta-item">•</span>
              <span style="color:#a5b4fc; font-weight:600">${courseObj.category}</span>
            </div>
          </div>
        </div>
        <button class="btn btn-primary">Start Course</button>
      `;
      row.addEventListener("click", () => openCourseViewer(courseObj.id));
      newlyAssignedContainer.appendChild(row);
    });
  }

  // 2. Render In Progress Section
  if (isEmptyDB) {
    ongoingGrid.innerHTML = `
      <div class="glass-card" style="padding: 2.5rem; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">
        No data currently
      </div>
    `;
  } else if (ongoingAssignments.length === 0) {
    ongoingGrid.innerHTML = `
      <div class="glass-card" style="padding: 2.5rem; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">
        No active courses. Start one of your newly assigned items above!
      </div>
    `;
  } else {
    ongoingAssignments.forEach(({ assign, courseObj }) => {
      const card = createCourseCard(assign, courseObj);
      ongoingGrid.appendChild(card);
    });
  }
}

// ==========================================================================
// MANDATORY COMPLIANCE TAB DRAW
// ==========================================================================
function renderMandatory() {
  const grid = document.getElementById("mandatory-courses-grid");
  grid.innerHTML = "";

  const assignments = (state.currentUser && state.assignments) ? (state.assignments[state.currentUser] || []) : [];
  
  const filtered = assignments.filter(({ courseId }) => {
    const courseObj = COURSES_DB.find(c => c.id === courseId);
    return courseObj && courseObj.type === "mandatory";
  });

  const isEmptyDB = COURSES_DB.length === 0;

  if (isEmptyDB) {
    grid.innerHTML = `
      <div class="glass-card" style="padding: 3rem; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">
        No data currently
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="glass-card" style="padding: 3rem; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">
        No mandatory compliance courses assigned.
      </div>
    `;
    return;
  }

  filtered.forEach(assign => {
    const courseObj = COURSES_DB.find(c => c.id === assign.courseId);
    const card = createCourseCard(assign, courseObj);
    grid.appendChild(card);
  });
}

// ==========================================================================
// PROJECT & SKILLS TAB DRAW
// ==========================================================================
function renderSkills() {
  const grid = document.getElementById("skills-courses-grid");
  grid.innerHTML = "";

  const assignments = (state.currentUser && state.assignments) ? (state.assignments[state.currentUser] || []) : [];
  
  const filtered = assignments.filter(({ courseId }) => {
    const courseObj = COURSES_DB.find(c => c.id === courseId);
    return courseObj && courseObj.type === "skill";
  });

  const isEmptyDB = COURSES_DB.length === 0;

  if (isEmptyDB) {
    grid.innerHTML = `
      <div class="glass-card" style="padding: 3rem; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">
        No data currently
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="glass-card" style="padding: 3rem; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">
        No project skill courses assigned.
      </div>
    `;
    return;
  }

  filtered.forEach(assign => {
    const courseObj = COURSES_DB.find(c => c.id === assign.courseId);
    const card = createCourseCard(assign, courseObj);
    grid.appendChild(card);
  });
}

// Helper: Build individual course card
function createCourseCard(assign, courseObj) {
  const card = document.createElement("div");
  card.className = `card glass-card course-card ${assign.progress === 100 ? 'completed' : ''}`;
  
  let bannerColorStyle = courseObj.bannerGradient;
  const isCompleted = assign.progress === 100;
  
  // Render dynamic deadline tag if course is not completed
  const deadlineHtml = (!isCompleted && assign.deadline) ? `
    <div class="deadline-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>Due: ${formatDeadlineDate(assign.deadline)}</span>
    </div>
  ` : '';

  card.innerHTML = `
    <div class="course-card-banner" style="background: ${bannerColorStyle}">
      <div class="course-category-tag">${courseObj.category}</div>
    </div>
    <div class="course-card-content">
      <h3 class="course-card-title">${courseObj.title}</h3>
      <p class="course-card-desc">${courseObj.description}</p>
      
      <div class="course-card-stats">
        <span class="meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${courseObj.duration}
        </span>
        <span>•</span>
        <span>${courseObj.difficulty}</span>
      </div>

      <div class="course-card-progress">
        <div class="progress-header">
          <span>${isCompleted ? 'Completed' : 'Progress'}</span>
          <strong>${assign.progress}%</strong>
        </div>
        <div class="progress-bar-outer">
          <div class="progress-bar-inner" style="width: ${assign.progress}%;"></div>
        </div>
      </div>
      
      ${deadlineHtml}
      
      ${isCompleted ? `
        <div class="completion-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          <span>✓ Course Completed!</span>
        </div>
      ` : ''}
    </div>
  `;

  card.addEventListener("click", () => {
    openCourseViewer(courseObj.id);
  });

  return card;
}

// ==========================================================================
// COURSE DETAIL VIEWER PORTLET
// ==========================================================================
function openCourseViewer(courseId) {
  const path = window.location.pathname.toLowerCase();
  if (!path.includes("viewer.html")) {
    window.location.href = `viewer.html?courseId=${courseId}`;
    return;
  }

  currentCourseId = courseId;
  
  // Set tab visibility explicitly
  const panes = document.querySelectorAll(".content-body > .tab-pane");
  panes.forEach(pane => pane.classList.remove("active"));
  const viewerPane = document.getElementById("course-viewer");
  if (viewerPane) {
    viewerPane.classList.add("active");
  }

  const courseObj = COURSES_DB.find(c => c.id === courseId);
  
  if (!state.assignments[state.currentUser]) {
    state.assignments[state.currentUser] = [];
  }
  const userAssignments = state.assignments[state.currentUser];
  let userAssign = userAssignments.find(a => a.courseId === courseId);

  // Safeguard: Create assignment tracking record if somehow non-existent
  if (!userAssign) {
    userAssign = { courseId: courseId, progress: 0, completedLessons: [], dateAssigned: new Date().toISOString().split('T')[0], status: "ongoing", deadline: getOneWeekDeadline() };
    userAssignments.push(userAssign);
    saveState();
  }

  // Update progress tags
  document.getElementById("viewer-course-category").textContent = courseObj.category;
  document.getElementById("viewer-course-title").textContent = courseObj.title;
  
  // Render Syllabus Table of Contents (TOC)
  const tocContainer = document.getElementById("course-toc-container");
  tocContainer.innerHTML = "";

  let firstLessonId = null;

  courseObj.chapters.forEach(chap => {
    const chapBox = document.createElement("div");
    chapBox.className = "toc-chapter";
    
    const chapTitle = document.createElement("div");
    chapTitle.className = "chapter-title";
    chapTitle.textContent = chap.title;
    chapBox.appendChild(chapTitle);

    const lessonsBox = document.createElement("div");
    lessonsBox.className = "chapter-lessons";

    chap.lessons.forEach(les => {
      if (!firstLessonId) firstLessonId = les.id;

      const item = document.createElement("button");
      item.className = "toc-lesson-item";
      if (userAssign.completedLessons.includes(les.id)) {
        item.classList.add("completed");
      }
      item.setAttribute("data-id", les.id);
      
      item.innerHTML = `
        <div class="lesson-left-wrapper">
          <div class="lesson-checkbox-dot"></div>
          <span class="lesson-link-title">${les.title}</span>
        </div>
        <span class="lesson-duration">${les.duration}</span>
      `;

      item.addEventListener("click", () => {
        loadLesson(les.id);
      });

      lessonsBox.appendChild(item);
    });

    chapBox.appendChild(lessonsBox);
    tocContainer.appendChild(chapBox);
  });

  // Default selection: load first incomplete lesson or simply the first lesson
  const incomplete = courseObj.chapters.flatMap(c => c.lessons).find(l => !userAssign.completedLessons.includes(l.id));
  const targetToLoad = incomplete ? incomplete.id : firstLessonId;
  loadLesson(targetToLoad);

  updateViewerProgressBar();
}

function updateViewerProgressBar() {
  const userAssignments = state.assignments[state.currentUser] || [];
  const userAssign = userAssignments.find(a => a.courseId === currentCourseId);
  if (!userAssign) return;

  document.getElementById("viewer-progress-percentage").textContent = `${userAssign.progress}%`;
  document.getElementById("viewer-progress-bar").style.width = `${userAssign.progress}%`;
}

// Load Lesson Content
function loadLesson(lessonId) {
  currentLessonId = lessonId;
  selectedQuizAnswer = null;

  // Highlight active sidebar list item
  const items = document.querySelectorAll(".toc-lesson-item");
  items.forEach(it => {
    if (it.getAttribute("data-id") === lessonId) {
      it.classList.add("active");
    } else {
      it.classList.remove("active");
    }
  });

  // Fetch course structure
  const courseObj = COURSES_DB.find(c => c.id === currentCourseId);
  let activeChapterIdx = 0;
  let activeLessonIdx = 0;
  let lessonObj = null;

  courseObj.chapters.forEach((chap, cIdx) => {
    chap.lessons.forEach((les, lIdx) => {
      if (les.id === lessonId) {
        activeChapterIdx = cIdx;
        activeLessonIdx = lIdx;
        lessonObj = les;
      }
    });
  });

  // Set visual indexes
  document.getElementById("lesson-index-indicator").textContent = `MODULE ${activeChapterIdx + 1} • LESSON ${activeLessonIdx + 1}`;
  document.getElementById("lesson-active-title").textContent = lessonObj.title;

  const contentArea = document.getElementById("lesson-body-content");
  
  // Format content body based on type
  if (lessonObj.type === "quiz") {
    // Construct HTML template for Interactive Quizzes
    contentArea.innerHTML = `
      <h3>Knowledge Assessment</h3>
      <p>Confirm your understanding of the concepts covered in this module by answering the quiz question below.</p>
      <div class="quiz-container">
        <div class="quiz-question">${lessonObj.quiz.question}</div>
        <div class="quiz-options">
          ${lessonObj.quiz.options.map((opt, oIdx) => `
            <label class="quiz-option-label" data-index="${oIdx}">
              <input type="radio" name="lesson-quiz-opt" value="${oIdx}" class="quiz-option-input">
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
        <div class="quiz-feedback-box" id="quiz-feedback"></div>
      </div>
    `;

    // Attach option listeners
    const optionLabels = contentArea.querySelectorAll(".quiz-option-label");
    optionLabels.forEach(label => {
      label.addEventListener("click", () => {
        if (selectedQuizAnswer !== null) return; // Answer locked
        
        const radio = label.querySelector(".quiz-option-input");
        radio.checked = true;
        
        const ansIndex = parseInt(radio.value);
        selectedQuizAnswer = ansIndex;

        // Feedback processing
        const feedbackBox = document.getElementById("quiz-feedback");
        const correctIndex = lessonObj.quiz.correctIndex;
        
        if (ansIndex === correctIndex) {
          label.classList.add("correct");
          feedbackBox.className = "quiz-feedback-box correct";
          feedbackBox.textContent = `Correct! ${lessonObj.quiz.explanation}`;
          
          // Enable completion auto-actions
          document.getElementById("complete-lesson-btn").removeAttribute("disabled");
        } else {
          label.classList.add("incorrect");
          optionLabels[correctIndex].classList.add("correct");
          feedbackBox.className = "quiz-feedback-box incorrect";
          feedbackBox.textContent = `Incorrect. ${lessonObj.quiz.explanation}`;
        }
      });
    });

  } else {
    // Regular reading / video lessons html content injection
    contentArea.innerHTML = lessonObj.content;
    
    // Video play simulation setup
    if (lessonObj.type === "video") {
      const playBtn = contentArea.querySelector("#sim-video-btn");
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          playBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation: spin 1s linear infinite"><circle cx="12" cy="12" r="10"/></svg>
          `;
          setTimeout(() => {
            playBtn.style.background = "var(--grad-success)";
            playBtn.innerHTML = `
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            `;
            // Enable autocomplete if it's a simulated video completion
            document.getElementById("complete-lesson-btn").removeAttribute("disabled");
          }, 1500);
        });
      }
    }
  }

  // Update Bottom Completion Buttons State
  const assignments = state.assignments[state.currentUser] || [];
  const userAssign = assignments.find(a => a.courseId === currentCourseId);
  const isCompleted = userAssign.completedLessons.includes(lessonId);

  const completeBtn = document.getElementById("complete-lesson-btn");
  const completeBtnText = document.getElementById("complete-btn-text");

  if (isCompleted) {
    completeBtn.className = "btn btn-secondary";
    completeBtnText.textContent = "Completed (Toggle Check)";
    completeBtn.disabled = false;
  } else {
    completeBtn.className = "btn btn-primary";
    completeBtnText.textContent = "Mark as Completed";
    
    // Quizzes require answering correctly before marking completed
    if (lessonObj.type === "quiz") {
      completeBtn.disabled = true; 
    } else {
      completeBtn.disabled = false;
    }
  }

  // Adjust Next/Prev navigation buttons
  const allLessons = courseObj.chapters.flatMap(c => c.lessons);
  const currentIdx = allLessons.findIndex(l => l.id === lessonId);

  document.getElementById("prev-lesson-btn").disabled = currentIdx === 0;
  document.getElementById("next-lesson-btn").disabled = currentIdx === allLessons.length - 1;
}

// Trigger completion status toggling
function toggleLessonCompletion() {
  const userAssignments = state.assignments[state.currentUser] || [];
  const userAssign = userAssignments.find(a => a.courseId === currentCourseId);
  if (!userAssign) return;

  const idx = userAssign.completedLessons.indexOf(currentLessonId);
  const isNowCompleted = idx === -1;

  if (isNowCompleted) {
    userAssign.completedLessons.push(currentLessonId);
  } else {
    userAssign.completedLessons.splice(idx, 1);
  }

  // Recalculate percentage
  const courseObj = COURSES_DB.find(c => c.id === currentCourseId);
  const totalLessonsCount = courseObj.chapters.reduce((acc, chap) => acc + chap.lessons.length, 0);
  const checkedCount = userAssign.completedLessons.length;
  
  const originalProgress = userAssign.progress;
  const newProgress = Math.round((checkedCount / totalLessonsCount) * 100);
  userAssign.progress = newProgress;

  // Set course completion status tags & handle deadline clear
  if (newProgress === 100) {
    userAssign.status = "completed";
    userAssign.deadline = null; // Clear deadline on complete
  } else if (newProgress === 0) {
    userAssign.status = "new";
    userAssign.deadline = getOneWeekDeadline();
  } else {
    userAssign.status = "ongoing";
    if (!userAssign.deadline) {
      userAssign.deadline = getOneWeekDeadline();
    }
  }

  saveState();

  // Sync progress to backend (best-effort — UI stays instant)
  const currentAssign = (state.assignments[state.currentUser] || [])
    .find(a => a.courseId === currentCourseId);
  if (currentAssign && currentAssign.assignmentId) {
    fetch(`${API_BASE}/progress/${currentAssign.assignmentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: currentLessonId, completed: isNowCompleted }),
    }).catch(err => console.warn("[Portal] Progress sync failed:", err));
  }

  // Highlight target checkbox visually
  const item = document.querySelector(`.toc-lesson-item[data-id="${currentLessonId}"]`);
  if (item) {
    if (isNowCompleted) {
      item.classList.add("completed");
    } else {
      item.classList.remove("completed");
    }
  }

  // Re-sync UI content buttons
  loadLesson(currentLessonId);
  updateViewerProgressBar();

  // If newly reached 100% completion, trigger celebratory animations!
  if (newProgress === 100 && originalProgress < 100) {
    triggerConfetti();
  }

  // Refresh behind items
  renderApp();
}

function navigateLesson(direction) {
  const courseObj = COURSES_DB.find(c => c.id === currentCourseId);
  const allLessons = courseObj.chapters.flatMap(c => c.lessons);
  const currentIdx = allLessons.findIndex(l => l.id === currentLessonId);
  const targetIdx = currentIdx + direction;

  if (targetIdx >= 0 && targetIdx < allLessons.length) {
    loadLesson(allLessons[targetIdx].id);
  }
}

// ==========================================================================
// PARTICLES / CONFETTI SYSTEM
// ==========================================================================
function triggerConfetti() {
  const container = document.getElementById("confetti-container");
  container.innerHTML = "";
  
  const colors = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#0ea5e9", "#f59e0b"];

  for (let i = 0; i < 80; i++) {
    const particle = document.createElement("div");
    particle.className = "confetti-particle";
    
    const size = Math.floor(Math.random() * 6) + 6;
    const startX = Math.random() * 100;
    const duration = (Math.random() * 2) + 2; // 2s - 4s
    const delay = Math.random() * 0.5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${startX}vw`;
    particle.style.top = `-20px`;
    particle.style.backgroundColor = color;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.transform = `rotate(${Math.random() * 360}deg)`;

    container.appendChild(particle);
  }

  setTimeout(() => {
    container.innerHTML = "";
  }, 4500);
}

// Start application
window.addEventListener("DOMContentLoaded", initApp);
