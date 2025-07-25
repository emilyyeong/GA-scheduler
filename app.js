// --- GLOBAL STATE & CONSTANTS ---
let commitments = [];
let tasks = [];
let preferences = {};
const TODAY = new Date('2025-07-23T00:00:00'); // Set a fixed date for consistent testing. THIS IS A WEDNESDAY.
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// --- DOM ELEMENTS (will be null if not on the current page, handled by checks) ---
const commitmentForm = document.getElementById('commitment-form');
const commitmentsList = document.getElementById('commitments-list');
const commitmentsNextBtn = document.getElementById('commitments-next-btn');
const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks-list');
const progressHeader = document.getElementById('progress-header');
const progressBar = document.getElementById('progress-bar');
const progressTitle = document.getElementById('progress-title');
const timetableGrid = document.getElementById('timetable-grid');
const errorBox = document.getElementById('error-message-box');
const errorMessage = document.getElementById('error-message');
const generateBtn = document.getElementById('generate-btn');
const generateBtnText = document.getElementById('generate-btn-text');
const generateSpinner = document.getElementById('generate-spinner');
const downloadPngBtn = document.getElementById('download-png-btn'); // For output.html
const viewWeeklyBtn = document.getElementById('view-weekly-btn');   // For output.html
const viewMonthlyBtn = document.getElementById('view-monthly-btn'); // For output.html
const weeklyView = document.getElementById('weekly-view');         // For output.html
const monthlyView = document.getElementById('monthly-view');       // For output.html
const monthHeader = document.getElementById('month-header');       // For output.html
const monthlyGrid = document.getElementById('monthly-grid');       // For output.html


// --- UTILITY FUNCTIONS ---
function showError(message) {
    if (errorBox && errorMessage) {
        errorMessage.textContent = message;
        errorBox.style.display = 'block';
        setTimeout(hideError, 5000); // Hide the error after 5 seconds
    }
}

function hideError() {
    if (errorBox) {
        errorBox.style.display = 'none';
    }
}

// Converts "HH:MM" (24h) to total minutes from week start
function timeToMinutes(day, timeStr) {
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (dayIndex * 24 * 60) + (hours * 60) + minutes;
}

// --- STATE PERSISTENCE ---
function saveState() {
    try {
        localStorage.setItem('commitments', JSON.stringify(commitments));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('preferences', JSON.stringify(preferences));
    } catch (e) {
        console.error("Error saving state to localStorage:", e);
        showError("Could not save your progress automatically. Please ensure browser storage is enabled.");
    }
}

function loadState() {
    try {
        const storedCommitments = localStorage.getItem('commitments');
        if (storedCommitments) {
            commitments = JSON.parse(storedCommitments);
        }
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
        const storedPreferences = localStorage.getItem('preferences');
        if (storedPreferences) {
            preferences = JSON.parse(storedPreferences);
        }
    } catch (e) {
        console.error("Error loading state from localStorage:", e);
        showError("Could not load previous progress. Starting fresh.");
        // Clear corrupt data
        localStorage.clear();
    }
}

// --- PAGE NAVIGATION ---
const pageMap = {
    'page-home': 'homepage.html',
    'page-commitments': 'commitments.html',
    'page-tasks': 'tasks.html',
    'page-preferences': 'preferences.html',
    'page-output': 'output.html'
};

const pageConfig = {
    'homepage.html': { id: 'page-home', progress: 0, title: '' },
    'commitments.html': { id: 'page-commitments', progress: 25, title: 'Step 1: Fixed Commitments' },
    'tasks.html': { id: 'page-tasks', progress: 50, title: 'Step 2: Your Tasks' },
    'preferences.html': { id: 'page-preferences', progress: 75, title: 'Step 3: Study Preferences' },
    'output.html': { id: 'page-output', progress: 100, title: 'Your Timetable!' }
};

function navigate(pageId) {
    hideError(); // Hide any current errors before navigating
    const filename = pageMap[pageId];
    if (filename) {
        window.location.href = filename;
    } else {
        console.error('Unknown pageId for navigation:', pageId);
    }
}

// Function to reset state and start over
function startOver() {
    localStorage.clear(); // Clear all stored data
    commitments = []; // Reset in-memory arrays
    tasks = [];
    preferences = {};
    navigate('page-home');
}

// --- COMMITMENTS PAGE LOGIC ---
function setupTimeInputs() {
    document.querySelectorAll('.time-input-container').forEach(container => {
        const amBtn = container.querySelector('.am-btn');
        const pmBtn = container.querySelector('.pm-btn');

        if (amBtn && pmBtn) {
            amBtn.addEventListener('click', () => {
                amBtn.classList.add('active');
                pmBtn.classList.remove('active');
            });
            pmBtn.addEventListener('click', () => {
                pmBtn.classList.add('active');
                amBtn.classList.remove('active');
            });

            // Set default active state if neither is active (e.g., on first load)
            if (!amBtn.classList.contains('active') && !pmBtn.classList.contains('active')) {
                amBtn.classList.add('active'); // Default to AM
            }
        }

        // Add input event listeners to ensure only 2 digits are entered for HH and MM
        let hourInput = container.querySelector('input[type="number"]:nth-of-type(1)');
        let minuteInput = container.querySelector('input[type="number"]:nth-of-type(2)');

        if (hourInput) {
            hourInput.addEventListener('input', (e) => {
                if (e.target.value.length > 2) {
                    e.target.value = e.target.value.slice(0, 2);
                }
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1 || val > 12) {
                    e.target.classList.add('border-red-500');
                } else {
                    e.target.classList.remove('border-red-500');
                }
            });
        }
        if (minuteInput) {
            minuteInput.addEventListener('input', (e) => {
                if (e.target.value.length > 2) {
                    e.target.value = e.target.value.slice(0, 2);
                }
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 0 || val > 59) {
                    e.target.classList.add('border-red-500');
                } else {
                    e.target.classList.remove('border-red-500');
                }
            });
        }
    });
}

function parseTimeInput(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    let hourInput = container.querySelector('input[type="number"]:nth-of-type(1)');
    let minuteInput = container.querySelector('input[type="number"]:nth-of-type(2)');

    let hour = parseInt(hourInput.value);
    const minute = parseInt(minuteInput.value) || 0;
    const isPm = container.querySelector('.pm-btn') && container.querySelector('.pm-btn').classList.contains('active');

    if (isNaN(hour) || hour < 1 || hour > 12) return null; // Basic validation
    if (isNaN(minute) || minute < 0 || minute > 59) return null; // Basic validation

    if (hour === 12) hour = isPm ? 12 : 0; // 12 PM is 12, 12 AM (midnight) is 0
    else if (isPm) hour += 12; // Add 12 for PM hours

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

if (commitmentForm) { // Only attach listener if on the commitments page
    commitmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideError();

        const name = document.getElementById('commitment-name').value;
        const day = document.getElementById('commitment-day').value;
        const start = parseTimeInput('start-time-input');
        const end = parseTimeInput('end-time-input');

        // Input validation
        if (!name || !day || !start || !end) {
            showError("Please fill in all commitment fields, including AM/PM selection and valid times.");
            return;
        }

        const newCommitment = {
            id: Date.now(), name, day, start, end,
            startMinutes: timeToMinutes(day, start),
            endMinutes: timeToMinutes(day, end),
        };

        // Basic time validation: end time must be after start time
        if (newCommitment.endMinutes <= newCommitment.startMinutes) {
            showError("End time must be after start time for the commitment.");
            return;
        }

        // Overlap check within the same day
        const overlap = commitments.find(c =>
            c.day === newCommitment.day &&
            newCommitment.startMinutes < c.endMinutes &&
            newCommitment.endMinutes > c.startMinutes
        );

        if (overlap) {
            showError(`This commitment overlaps with "${overlap.name}" (${overlap.day}, ${overlap.start}-${overlap.end}).`);
            return;
        }

        commitments.push(newCommitment);
        saveState(); // Save state after adding
        renderCommitments();
        commitmentForm.reset();
        // Reset AM/PM buttons to a default state (e.g., AM active)
        document.querySelectorAll('.time-input-container button').forEach(b => b.classList.remove('active'));
        document.querySelector('#start-time-input .am-btn').classList.add('active');
        document.querySelector('#end-time-input .am-btn').classList.add('active');
    });
}

function renderCommitments() {
    if (!commitmentsList || !commitmentsNextBtn) return; // Exit if elements are not on this page

    commitmentsNextBtn.disabled = commitments.length === 0;
    if (commitments.length === 0) {
        commitmentsList.innerHTML = '<p class="text-slate-500 text-center py-10">You can add commitments like classes, appointments, or work shifts.</p>';
        return;
    }
    commitmentsList.innerHTML = '';
    commitments.forEach(c => {
        const el = document.createElement('div');
        el.className = 'bg-white p-3 rounded-lg flex justify-between items-center shadow-sm';
        el.innerHTML = `
            <div>
                <p class="font-semibold">${c.name}</p>
                <p class="text-sm text-slate-500">${c.day}, ${c.start} - ${c.end}</p>
            </div>
            <button onclick="removeCommitment(${c.id})" class="text-red-500 hover:text-red-700 p-1 rounded-full">&times;</button>`;
        commitmentsList.appendChild(el);
    });
}

function removeCommitment(id) {
    commitments = commitments.filter(c => c.id !== id);
    saveState(); // Save state after removing
    renderCommitments();
}

// --- TASKS PAGE LOGIC ---
if (taskForm) { // Only attach listener if on the tasks page
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideError(); // Hide any previous errors

        const name = document.getElementById('task-name').value;
        const duration = parseFloat(document.getElementById('task-duration').value);
        const due = document.getElementById('task-due').value;
        let priority = parseInt(document.getElementById('task-priority').value);

        if (!name || isNaN(duration) || duration <= 0 || !due) {
            showError("Please fill in all task fields correctly. Duration must be a positive number.");
            return;
        }

        // Auto-prioritize if due date is near
        const dueDate = new Date(due + "T23:59:59"); // Consider end of day
        const diffTime = dueDate.getTime() - TODAY.getTime(); // Use getTime() for proper comparison
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 5 && priority < 10) { // If due in 5 days or less, set to high priority (10)
            priority = 10;
        }

        tasks.push({ id: Date.now(), name, duration, due, priority });
        saveState(); // Save state after adding
        renderTasks();
        taskForm.reset();
        if (document.getElementById('task-priority')) {
            document.getElementById('task-priority').value = 5; // Reset priority slider
        }
    });
}

function renderTasks() {
    if (!tasksList || !document.getElementById('tasks-next-btn')) return; // Exit if elements are not on this page

    // Enable/disable the 'Next' button based on tasks.length
    document.getElementById('tasks-next-btn').disabled = tasks.length === 0;

    if (tasks.length === 0) {
        tasksList.innerHTML = '<p class="text-slate-500 text-center py-10">Add at least one task to continue.</p>';
        return;
    }
    tasksList.innerHTML = '';
    const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority); // Sort by priority descending
    sortedTasks.forEach(t => {
        const el = document.createElement('div');
        el.className = `bg-white p-3 rounded-lg flex justify-between items-center shadow-sm border-l-4 ${t.priority === 10 ? 'border-red-500' : 'border-transparent'}`;
        el.innerHTML = `
            <div>
                <p class="font-semibold">${t.name}</p>
                <p class="text-sm text-slate-500">Due: ${t.due} | Duration: ${t.duration}h | Priority: ${t.priority}</p>
            </div>
            <button onclick="removeTask(${t.id})" class="text-red-500 hover:text-red-700 p-1 rounded-full">&times;</button>`;
        tasksList.appendChild(el);
    });
}

function removeTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveState(); // Save state after removing
    renderTasks();
}

// --- PREFERENCES PAGE LOGIC ---
// Preferences are captured when runScheduler is called.
// No specific render function needed for preferences, as they are UI driven.


// --- SCHEDULER & GENETIC ALGORITHM ---
async function runScheduler() {
    // Show loading state
    if (generateBtn) {
        generateBtn.disabled = true;
        if (generateSpinner) generateSpinner.style.display = 'block';
        if (generateBtnText) generateBtnText.textContent = 'Optimizing...';
    }

    // Collect preferences (ensure these elements exist or handle null)
    // Only collect if on the preferences page
    if (document.getElementById('page-preferences')) {
        const preferredTimesElements = document.querySelectorAll('#page-preferences input[type="checkbox"]:checked');
        const preferredTimes = Array.from(preferredTimesElements).map(cb => cb.value);
        const sessionLengthElement = document.querySelector('#page-preferences input[name="session-length"]:checked');
        const sessionLength = sessionLengthElement ? parseInt(sessionLengthElement.value) : 30; // Default to 30 if not found
        const wantsBreaksElement = document.querySelector('#page-preferences input[name="breaks"]:checked');
        const wantsBreaks = wantsBreaksElement ? wantsBreaksElement.value === 'yes' : true; // Default to yes

        preferences = { preferredTimes, sessionLength, wantsBreaks };
        saveState(); // Save preferences immediately
    }


    // Basic validation before scheduling
    if (tasks.length === 0) {
        showError("Please add at least one task before generating a timetable.");
        if (generateBtn) { // Reset button state
            generateBtn.disabled = false;
            if (generateSpinner) generateSpinner.style.display = 'none';
            if (generateBtnText) generateBtnText.textContent = 'Generate Timetable';
        }
        return;
    }

    // Use a timeout to allow the UI to update before the heavy computation starts
    setTimeout(() => {
        try {
            // ** GENETIC ALGORITHM EXECUTION **
            const bestSchedule = geneticAlgorithm(commitments, tasks, preferences);

            // Store the best schedule to local storage before navigating
            localStorage.setItem('lastSchedule', JSON.stringify(bestSchedule));

            // Navigate to the output page
            navigate('page-output');

            // renderTimetable will be called on the output page's onload
        } catch (error) {
            console.error("Error during scheduling:", error);
            showError("Could not generate a schedule. Please check your inputs or try different preferences. (Error: " + error.message + ")");
            // No need to navigate back, the user is still on preferences.html
        } finally {
            // Reset button state on the current page (preferences.html)
            if (generateBtn) {
                generateBtn.disabled = false;
                if (generateSpinner) generateSpinner.style.display = 'none';
                if (generateBtnText) generateBtnText.textContent = 'Generate Timetable';
            }
        }
    }, 100); // 100ms delay
}


function geneticAlgorithm(commitments, tasks, preferences) {
    // --- GA PARAMETERS ---
    const POPULATION_SIZE = 50;
    const GENERATIONS = 100;
    const MUTATION_RATE = 0.1;
    const ELITISM_RATE = 0.1; // Keep top 10% of population

    // --- 1. PREPARE DATA ---
    // **FIX**: Calculate the Monday of the week for accurate date calculations.
    const todayDayOfWeek = TODAY.getDay(); // Sunday: 0, ..., Wednesday: 3, ...
    // JS Sunday is 0. If it's Sunday, we need to go back 6 days to get to Monday. Otherwise, it's day number - 1.
    const offsetToMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
    const mondayOfWeek = new Date(TODAY);
    mondayOfWeek.setDate(TODAY.getDate() - offsetToMonday);


    // Create a boolean array for every 30-min slot in the week
    const timeSlotsInWeek = 7 * 24 * 2; // 30-min slots (7 days * 24 hours/day * 2 slots/hour)
    const availability = new Array(timeSlotsInWeek).fill(true);

    // Block out sleeping hours (12am - 8am)
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayStartSlot = dayIndex * 24 * 2;
        // Slots from 00:00 to 07:30 are 16 slots (0 to 15)
        for (let slot = 0; slot < 16; slot++) {
            const slotIndex = dayStartSlot + slot;
            if (slotIndex < timeSlotsInWeek) {
                availability[slotIndex] = false;
            }
        }
    }

    // Block out commitment times
    commitments.forEach(c => {
        const startSlot = Math.floor(timeToMinutes(c.day, c.start) / 30);
        const endSlot = Math.ceil(timeToMinutes(c.day, c.end) / 30);
        for (let i = startSlot; i < endSlot; i++) {
            if (i >= 0 && i < timeSlotsInWeek) { // Ensure slot index is within bounds
                availability[i] = false;
            }
        }
    });

    // Convert tasks into 30-min blocks
    const taskBlocks = tasks.flatMap(task =>
        Array(Math.ceil(task.duration * 2)).fill({ taskId: task.id, taskName: task.name, priority: task.priority, due: task.due, originalDuration: task.duration })
    );

    // --- 2. HELPER FUNCTIONS ---
    const createIndividual = () => {
        let schedule = new Array(timeSlotsInWeek).fill(null);
        let availableSlots = availability.map((avail, i) => avail ? i : -1).filter(i => i !== -1);

        // Shuffle task blocks to ensure randomness in placement
        const shuffledTaskBlocks = [...taskBlocks].sort(() => Math.random() - 0.5);

        for (const block of shuffledTaskBlocks) {
            if (availableSlots.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableSlots.length);
            const slotIndex = availableSlots.splice(randomIndex, 1)[0];
            schedule[slotIndex] = block;
        }
        return schedule;
    };

    const calculateFitness = (schedule) => {
        let score = 0;
        const taskCompletion = {}; // { taskId: blocksPlaced }
        const taskContiguity = {}; // { taskId: maxContiguousBlocks }

        // Initialize task completion and contiguity trackers
        tasks.forEach(task => {
            taskCompletion[task.id] = 0;
            taskContiguity[task.id] = { current: 0, max: 0 };
        });

        for(let i = 0; i < schedule.length; i++) {
            if (schedule[i]) {
                const block = schedule[i];
                const taskOriginal = tasks.find(t => t.id === block.taskId);
                if (!taskOriginal) continue; 

                taskCompletion[block.taskId]++;

                // Update contiguity
                if (i > 0 && schedule[i-1] && schedule[i-1].taskId === block.taskId) {
                    taskContiguity[block.taskId].current++;
                } else {
                    taskContiguity[block.taskId].current = 1;
                }
                taskContiguity[block.taskId].max = Math.max(taskContiguity[block.taskId].max, taskContiguity[block.taskId].current);


                // a. Preference Score (Time of Day)
                const dayIndex = Math.floor(i / (24 * 2)); 
                const hour = Math.floor((i % (24*2)) / 2); 
                if ((hour >= 8 && hour < 12 && preferences.preferredTimes.includes('morning')) || // morning 8am-12pm
                    (hour >= 12 && hour < 17 && preferences.preferredTimes.includes('afternoon')) || // afternoon 12pm-5pm
                    (hour >= 17 && hour < 21 && preferences.preferredTimes.includes('evening')) || // evening 5pm-9pm
                    (hour >= 21 || hour < 4) && preferences.preferredTimes.includes('night')) { // night 9pm-4am
                    score += 5;
                }

                // b. Urgency Score (based on priority and due date)
                const dueDate = new Date(block.due + "T23:59:59"); 
                // **FIX**: Calculate the slot's actual date based on the Monday of the week.
                const slotDate = new Date(mondayOfWeek);
                slotDate.setDate(mondayOfWeek.getDate() + dayIndex); 

                const diffTime = dueDate.getTime() - slotDate.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24); 

                if (diffDays < 0) {
                    score -= 1000; // HUGE penalty for being late
                } else {
                    score += block.priority * 10; 
                    score += Math.max(0, 50 - (diffDays * 5)); 
                }

                // c. Avoid commitments (already handled by availability, but double check for robustness)
                if (!availability[i]) {
                    score -= 2000; // Extreme penalty for placing where not available
                }
            }
        }
        
        // --- NEW: PENALTY FOR NO BREAKS ---
        if(preferences.wantsBreaks) {
             for (let i = 1; i < schedule.length; i++) {
                // If the current slot has a task
                if (schedule[i]) {
                    // Check if the previous slot was also occupied, and it's not the same task continuing
                    const previousSlotWasCommitment = !schedule[i-1] && !availability[i-1];
                    const previousSlotWasDifferentTask = schedule[i-1] && schedule[i-1].taskId !== schedule[i].taskId;
                    
                    if (previousSlotWasCommitment || previousSlotWasDifferentTask) {
                        score -= 100; // Apply a heavy penalty for back-to-back activities without a break
                    }
                }
            }
        }

        // d. Task Completion Score (Primary objective)
        let totalBlocksNeeded = 0;
        tasks.forEach(task => totalBlocksNeeded += Math.ceil(task.duration * 2));
        const placedBlocks = Object.values(taskCompletion).reduce((a, b) => a + b, 0);

        if (placedBlocks < totalBlocksNeeded) {
            score -= (totalBlocksNeeded - placedBlocks) * 5000; // Very heavy penalty for incomplete tasks
        } else {
            score += 20000; // Big bonus for full completion
        }

        // e. Contiguous Session Score & Session Length Preference
        tasks.forEach(task => {
            // Reward for contiguity
            score += taskContiguity[task.id].max * 50; 
        });

        // g. Penalize for fragmented tasks
        Object.entries(taskCompletion).forEach(([taskId, blocksPlaced]) => {
            const requiredBlocks = Math.ceil(tasks.find(t => t.id == taskId).duration * 2);
            if (blocksPlaced > 0 && blocksPlaced < requiredBlocks) {
                // Penalize if only a fraction of a task is scheduled
                score -= (requiredBlocks - blocksPlaced) * 100;
            }
        });

        return score;
    };

    const crossover = (parent1, parent2) => {
        const crossoverPoint = Math.floor(Math.random() * timeSlotsInWeek);
        const child = new Array(timeSlotsInWeek).fill(null);

        // Copy first part from parent1
        for (let i = 0; i < crossoverPoint; i++) {
            child[i] = parent1[i];
        }
        // Copy second part from parent2
        for (let i = crossoverPoint; i < timeSlotsInWeek; i++) {
            child[i] = parent2[i];
        }

        // Repair mechanism: Ensure all task blocks are present and none are duplicated excessively
        const requiredTaskBlockCounts = {};
        tasks.forEach(task => {
            requiredTaskBlockCounts[task.id] = Math.ceil(task.duration * 2);
        });

        const currentTaskBlockCounts = {};
        const unplacedBlocks = [];

        // Track what's in the child and what's missing/extra
        for (let i = 0; i < child.length; i++) {
            const block = child[i];
            if (block) {
                currentTaskBlockCounts[block.taskId] = (currentTaskBlockCounts[block.taskId] || 0) + 1;
                // If this slot is unavailable or we already have enough blocks for this task, remove it
                if (!availability[i] || currentTaskBlockCounts[block.taskId] > requiredTaskBlockCounts[block.taskId]) {
                    child[i] = null; // Mark for removal
                }
            }
        }

        // Collect blocks that were marked for removal or are completely missing
        tasks.forEach(task => {
            const currentCount = currentTaskBlockCounts[task.id] || 0;
            const needed = requiredTaskBlockCounts[task.id] - currentCount;
            if (needed > 0) {
                 for (let i = 0; i < needed; i++) {
                    unplacedBlocks.push({ taskId: task.id, taskName: task.name, priority: task.priority, due: task.due, originalDuration: task.duration });
                }
            }
        });

        // Try to place unplaced blocks into available (and currently empty) slots
        let availableEmptySlots = availability.map((avail, i) => avail && !child[i] ? i : -1).filter(i => i !== -1);
        availableEmptySlots = availableEmptySlots.sort(() => Math.random() - 0.5); // Shuffle for random placement

        for (const block of unplacedBlocks) {
            if (availableEmptySlots.length > 0) {
                const slotIndex = availableEmptySlots.pop();
                child[slotIndex] = block;
            } else {
                break;
            }
        }

        return child;
    };


    const mutate = (schedule) => {
        if (Math.random() < MUTATION_RATE) {
            const filledSlots = [];
            const emptySlots = [];
            for(let i=0; i<schedule.length; i++) {
                if(schedule[i] && availability[i]) filledSlots.push(i); // Only consider filled, available slots
                else if(availability[i] && !schedule[i]) emptySlots.push(i); // Only consider empty, available slots
            }

            if(filledSlots.length > 0 && emptySlots.length > 0) {
                const slotToMoveFrom = filledSlots[Math.floor(Math.random() * filledSlots.length)];
                const slotToMoveTo = emptySlots[Math.floor(Math.random() * emptySlots.length)];

                // Perform the swap
                const tempBlock = schedule[slotToMoveFrom];
                schedule[slotToMoveFrom] = null;
                schedule[slotToMoveTo] = tempBlock;
            } else if (filledSlots.length > 1) { // If no empty slots, just swap two filled slots
                const idx1 = Math.floor(Math.random() * filledSlots.length);
                let idx2 = Math.floor(Math.random() * filledSlots.length);
                while (idx1 === idx2) { // Ensure different indices
                    idx2 = Math.floor(Math.random() * filledSlots.length);
                }
                const slot1 = filledSlots[idx1];
                const slot2 = filledSlots[idx2];
                [schedule[slot1], schedule[slot2]] = [schedule[slot2], schedule[slot1]];
            }
        }
        return schedule;
    };

    // --- 3. EVOLUTION LOOP ---
    let population = Array(POPULATION_SIZE).fill(0).map(createIndividual);

    for (let gen = 0; gen < GENERATIONS; gen++) {
        // Evaluate fitness
        let rankedPopulation = population.map(ind => ({ individual: ind, fitness: calculateFitness(ind) }))
                                         .sort((a, b) => b.fitness - a.fitness);

        let newPopulation = [];

        // Elitism: Keep the best individuals
        const eliteCount = Math.floor(POPULATION_SIZE * ELITISM_RATE);
        for(let i=0; i<eliteCount; i++) {
            newPopulation.push(rankedPopulation[i].individual);
        }

        // Crossover & Mutation to fill the rest of the population
        while (newPopulation.length < POPULATION_SIZE) {
            // Tournament Selection: Pick 2 parents from a small subset of the population
            const selectParent = () => {
                const tournamentSize = 5;
                let best = null;
                for(let i = 0; i < tournamentSize; i++) {
                    const randomIndividual = rankedPopulation[Math.floor(Math.random() * rankedPopulation.length)];
                    if (best === null || randomIndividual.fitness > best.fitness) {
                        best = randomIndividual;
                    }
                }
                return best.individual;
            };

            const parent1 = selectParent();
            const parent2 = selectParent();

            let child = crossover(parent1, parent2);
            child = mutate(child);
            newPopulation.push(child);
        }
        population = newPopulation;
    }

    // Return the best individual from the final population
    const bestIndividual = population.map(ind => ({ individual: ind, fitness: calculateFitness(ind) }))
                                     .sort((a, b) => b.fitness - a.fitness)[0].individual;

    // Post-process the schedule for display (grouping blocks into sessions)
    const finalSchedule = [];
    for (let i = 0; i < bestIndividual.length; i++) {
        if (bestIndividual[i]) {
            const currentBlock = bestIndividual[i];
            const day = DAYS_OF_WEEK[Math.floor(i / (24 * 2))];
            const startHour = Math.floor((i % (24 * 2)) / 2);
            const startMinute = (i % 2) * 30;

            // Check if this block continues a previous session
            if (finalSchedule.length > 0) {
                const lastSession = finalSchedule[finalSchedule.length - 1];
                // Check if it's the same task, contiguous in time, and on the same day
                if (lastSession.taskId === currentBlock.taskId &&
                    lastSession.day === day &&
                    (i === lastSession.endSlot + 1)) {
                    lastSession.duration += 0.5; // Add 30 mins
                    lastSession.endSlot = i;
                    continue; // Skip adding new session, extended existing one
                }
            }

            // Start a new session
            finalSchedule.push({
                id: `session_${currentBlock.taskId}_${Date.now()}_${Math.random()}`, // Unique ID for drag-drop
                taskId: currentBlock.taskId,
                taskName: currentBlock.taskName,
                day: day,
                startHour: startHour,
                startMinute: startMinute,
                duration: 0.5, // Start with 30 mins
                priority: currentBlock.priority,
                due: currentBlock.due,
                startSlot: i,
                endSlot: i,
                type: 'task'
            });
        }
    }

    // Add commitments to the final schedule (for rendering only)
    commitments.forEach(c => {
        const startHour = parseInt(c.start.split(':')[0]);
        const startMinute = parseInt(c.start.split(':')[1]);
        const endHour = parseInt(c.end.split(':')[0]);
        const endMinute = parseInt(c.end.split(':')[1]);
        const durationHours = (endHour - startHour) + (endMinute - startMinute) / 60;

        finalSchedule.push({
            id: `commitment_${c.id}`, // Unique ID for commitments
            taskId: null, // No task ID for commitments
            taskName: c.name,
            day: c.day,
            startHour: startHour,
            startMinute: startMinute,
            duration: durationHours,
            type: 'commitment'
        });
    });

    return finalSchedule.sort((a, b) => {
        // Sort by day, then by start time
        const dayA = DAYS_OF_WEEK.indexOf(a.day);
        const dayB = DAYS_OF_WEEK.indexOf(b.day);
        if (dayA !== dayB) return dayA - dayB;

        const timeA = a.startHour * 60 + a.startMinute;
        const timeB = b.startHour * 60 + a.startMinute;
        return timeA - timeB;
    });
}

// --- DRAG AND DROP HANDLERS ---
function handleDragStart(event, session) {
    // Only allow tasks to be dragged
    if (session.type !== 'task') {
        event.preventDefault();
        return;
    }
    event.dataTransfer.setData('application/json', JSON.stringify(session));
    event.dataTransfer.effectAllowed = 'move';
    // Use a timeout to allow the browser to render the drag image before applying class
    setTimeout(() => {
        event.target.classList.add('dragging');
    }, 0);
}

function handleDragOver(event) {
    event.preventDefault();
    const targetCell = event.target.closest('.drop-zone');
    if (targetCell) {
        targetCell.classList.add('drop-target-valid');
    }
}

function handleDragLeave(event) {
    const targetCell = event.target.closest('.drop-zone');
    if (targetCell) {
        targetCell.classList.remove('drop-target-valid');
    }
}

function handleDrop(event, day, hour, minute) {
    event.preventDefault();
    hideError();
    const targetCell = event.target.closest('.drop-zone');
    if (targetCell) {
        targetCell.classList.remove('drop-target-valid');
    }

    const sessionData = JSON.parse(event.dataTransfer.getData('application/json'));
    const schedule = JSON.parse(localStorage.getItem('lastSchedule'));

    // --- Collision Detection ---
    const newStartMinutes = timeToMinutes(day, `${hour}:${minute}`);
    const newEndMinutes = newStartMinutes + (sessionData.duration * 60);

    // Create a temporary schedule without the dragged item for checking collisions
    const otherItems = schedule.filter(item => item.id !== sessionData.id);

    const collision = otherItems.find(item => {
        const itemStartMinutes = timeToMinutes(item.day, `${String(item.startHour).padStart(2,'0')}:${String(item.startMinute).padStart(2,'0')}`);
        const itemEndMinutes = itemStartMinutes + (item.duration * 60);
        // Check for time overlap
        return newStartMinutes < itemEndMinutes && newEndMinutes > itemStartMinutes;
    });

    if (collision) {
        showError(`Cannot move task here. It conflicts with "${collision.taskName}".`);
        // We still need to re-render to remove the 'dragging' class properly
        const draggedElement = document.querySelector(`[data-session-id="${sessionData.id}"]`);
        if(draggedElement) draggedElement.classList.remove('dragging');
        return; 
    }

    // No collision, proceed with the update
    const updatedSchedule = schedule.map(item => {
        if (item.id === sessionData.id) {
            // This is the item we moved, update its details
            return {
                ...item,
                day: day,
                startHour: hour,
                startMinute: minute,
            };
        }
        return item; // This is another item, return it as is
    });

    // Save the new schedule and re-render
    localStorage.setItem('lastSchedule', JSON.stringify(updatedSchedule));
    renderTimetable(updatedSchedule);
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
}


// --- OUTPUT PAGE LOGIC ---
function renderTimetable(schedule) {
    if (!timetableGrid || !monthlyGrid) return; // Exit if elements are not on this page

    // Re-sort the schedule by time before rendering
    const sortedSchedule = schedule.sort((a, b) => {
        const dayA = DAYS_OF_WEEK.indexOf(a.day);
        const dayB = DAYS_OF_WEEK.indexOf(b.day);
        if (dayA !== dayB) return dayA - dayB;
        const timeA = a.startHour * 60 + a.startMinute;
        const timeB = b.startHour * 60 + b.startMinute;
        return timeA - timeB;
    });

    // Render Weekly View
    renderWeeklyView(sortedSchedule);

    // Render Monthly View
    renderMonthlyView(sortedSchedule);

    // Add event listeners for view toggling
    if (viewWeeklyBtn && viewMonthlyBtn) {
        viewWeeklyBtn.addEventListener('click', () => {
            if (weeklyView && monthlyView) {
                weeklyView.style.display = 'block';
                monthlyView.style.display = 'none';
                viewWeeklyBtn.classList.add('bg-indigo-600', 'text-white');
                viewWeeklyBtn.classList.remove('bg-slate-200', 'text-slate-800');
                viewMonthlyBtn.classList.remove('bg-indigo-600', 'text-white');
                viewMonthlyBtn.classList.add('bg-slate-200', 'text-slate-800');
            }
        });
        viewMonthlyBtn.addEventListener('click', () => {
            if (weeklyView && monthlyView) {
                weeklyView.style.display = 'none';
                monthlyView.style.display = 'block';
                viewMonthlyBtn.classList.add('bg-indigo-600', 'text-white');
                viewMonthlyBtn.classList.remove('bg-slate-200', 'text-slate-800');
                viewWeeklyBtn.classList.remove('bg-indigo-600', 'text-white');
                viewWeeklyBtn.classList.add('bg-slate-200', 'text-slate-800');
            }
        });
    }
}


function renderWeeklyView(schedule) {
    if (!timetableGrid) return;
    timetableGrid.innerHTML = ''; // Clear previous content

    const totalRows = (24 - 8) * 2; // 32 half-hour slots from 8am to midnight
    timetableGrid.style.gridTemplateRows = `auto repeat(${totalRows}, minmax(30px, auto))`;

    // Create header row
    const cornerCell = document.createElement('div');
    cornerCell.className = 'sticky top-0 z-20 bg-slate-100 border-b border-r border-slate-200 h-10';
    timetableGrid.appendChild(cornerCell);

    DAYS_OF_WEEK.forEach(day => {
        const header = document.createElement('div');
        header.className = 'sticky top-0 z-20 font-semibold text-center border-b border-r border-slate-200 p-2 text-sm md:text-base bg-slate-100';
        header.textContent = day;
        timetableGrid.appendChild(header);
    });

    // Create time labels and grid cells
    const cells = new Map(); // To hold references to all grid cells for placing items later
    for (let i = 0; i < totalRows; i++) {
        const hour = 8 + Math.floor(i / 2);
        const minute = (i % 2) * 30;
        const gridRowStart = i + 2;

        // Time label cell
        if (minute === 0) { // Only add one label per hour
            const timeLabel = document.createElement('div');
            timeLabel.className = 'text-xs md:text-sm text-right pr-2 border-r border-slate-200 bg-slate-50 flex items-center justify-end sticky left-0 z-10';
            timeLabel.textContent = `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`;
            timeLabel.style.gridRow = `${gridRowStart} / span 2`;
            timeLabel.style.gridColumn = '1';
            timetableGrid.appendChild(timeLabel);
        }

        // Cells for each day in this time slot
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const day = DAYS_OF_WEEK[dayIndex];
            const cell = document.createElement('div');
            
            cell.className = `border-b border-r border-slate-200 min-h-[30px] drop-zone`;
            cell.style.gridRow = `${gridRowStart}`;
            cell.style.gridColumn = `${dayIndex + 2}`;
            
            cell.dataset.day = day;
            cell.dataset.hour = hour;
            cell.dataset.minute = minute;
            cell.addEventListener('dragover', handleDragOver);
            cell.addEventListener('dragleave', handleDragLeave);
            cell.addEventListener('drop', (e) => handleDrop(e, day, hour, minute));
            
            timetableGrid.appendChild(cell);
            cells.set(`${day}-${hour}-${minute}`, cell);
        }
    }

    // Place schedule items onto the grid
    schedule.forEach(item => {
        if (item.startHour < 8) return; // Don't render items before 8am in weekly view
        const startRowIndex = (item.startHour - 8) * 2 + Math.floor(item.startMinute / 30);
        const durationSlots = Math.ceil(item.duration * 2); // e.g., 1 hour = 2 slots
        const dayIndex = DAYS_OF_WEEK.indexOf(item.day);

        const itemEl = document.createElement('div');
        const isTask = item.type === 'task';
        const colorClass = isTask ? 'bg-indigo-200 text-indigo-800 border-l-4 border-indigo-500' : 'bg-slate-200 text-slate-800';
        const zIndex = isTask ? 'z-10' : 'z-5';

        itemEl.className = `p-2 rounded-lg shadow-sm text-xs h-full flex flex-col justify-center ${colorClass} ${isTask ? 'task-block' : ''} ${zIndex} relative`;
        itemEl.style.gridRow = `${startRowIndex + 2} / span ${durationSlots}`;
        itemEl.style.gridColumn = `${dayIndex + 2}`;
        itemEl.innerHTML = `<strong class="font-bold">${item.taskName}</strong>`;

        if (isTask) {
            itemEl.draggable = true;
            itemEl.dataset.sessionId = item.id;
            itemEl.addEventListener('dragstart', (e) => handleDragStart(e, item));
            itemEl.addEventListener('dragend', handleDragEnd);
        }

        timetableGrid.appendChild(itemEl);

        // Mark the cells underneath the placed item so they are not considered drop zones
        for (let i = 0; i < durationSlots; i++) {
            const currentSlotRow = startRowIndex + i;
            const hour = 8 + Math.floor(currentSlotRow / 2);
            const minute = (currentSlotRow % 2) * 30;
            const underlyingCell = cells.get(`${item.day}-${hour}-${minute}`);
            if (underlyingCell) {
                underlyingCell.classList.remove('drop-zone');
                underlyingCell.removeEventListener('dragover', handleDragOver);
                underlyingCell.removeEventListener('dragleave', handleDragLeave);
                underlyingCell.removeEventListener('drop', handleDrop);
            }
        }
    });
}



function renderMonthlyView(schedule) {
    if (!monthlyGrid || !monthHeader) return;
    monthlyGrid.innerHTML = ''; // Clear previous content

    // **FIX**: Calculate the Monday of the week to correctly map schedule items to calendar dates.
    const todayDayOfWeek = TODAY.getDay();
    const offsetToMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
    const mondayOfWeek = new Date(TODAY);
    mondayOfWeek.setDate(TODAY.getDate() - offsetToMonday);

    // Set current month header (example: "July 2025")
    monthHeader.textContent = TODAY.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Days of the week header for monthly view
    DAYS_OF_WEEK.forEach(day => {
        const headerCell = document.createElement('div');
        headerCell.className = 'font-semibold text-center py-2 border-r border-b border-slate-200 bg-slate-50';
        headerCell.textContent = day;
        monthlyGrid.appendChild(headerCell);
    });

    // Determine the first day of the month and number of days
    const firstDayOfMonth = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
    const daysInMonth = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0).getDate();
    const startDayOffset = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Adjust for Monday-first week

    // Fill in leading empty days
    for (let i = 0; i < startDayOffset; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'border-r border-b border-slate-200 p-2 min-h-[120px] bg-slate-50';
        monthlyGrid.appendChild(emptyCell);
    }

    // Fill in days of the month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'border-r border-b border-slate-200 p-2 min-h-[120px] flex flex-col relative calendar-day';
        dayCell.innerHTML = `<div class="font-bold text-slate-700 mb-1">${dayNum}</div>`;

        // **FIX**: Correctly filter tasks for the current calendar day.
        const tasksForDay = schedule.filter(item => {
            const itemDate = new Date(mondayOfWeek);
            itemDate.setDate(mondayOfWeek.getDate() + DAYS_OF_WEEK.indexOf(item.day));
            return itemDate.getDate() === dayNum && 
                   itemDate.getMonth() === TODAY.getMonth() &&
                   itemDate.getFullYear() === TODAY.getFullYear();
        });

        const taskList = document.createElement('div');
        taskList.className = 'space-y-1 text-xs overflow-y-auto custom-scrollbar';
        tasksForDay.forEach(item => {
            const itemEl = document.createElement('div');
            const colorClass = item.type === 'task' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-800';
            itemEl.className = `p-1 rounded ${colorClass} truncate`;
            const startTime = `${String(item.startHour).padStart(2, '0')}:${String(item.startMinute).padStart(2, '0')}`;
            itemEl.textContent = `${startTime} ${item.taskName}`;
            itemEl.title = `${item.taskName} (${startTime}, ${item.duration}h)`;
            taskList.appendChild(itemEl);
        });
        dayCell.appendChild(taskList);
        monthlyGrid.appendChild(dayCell);
    }
     // Fill in trailing empty days
    const totalCells = startDayOffset + daysInMonth;
    const remainingCellsInLastRow = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remainingCellsInLastRow; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'border-r border-b border-slate-200 p-2 min-h-[120px] bg-slate-50';
        monthlyGrid.appendChild(emptyCell);
    }

    monthlyGrid.style.gridTemplateColumns = `repeat(7, 1fr)`;
}


// --- INITIALIZATION ---
window.onload = () => {
    loadState(); // Load state on every page load

    // Initialize time input UI elements if they exist on the current page
    if (document.querySelector('.time-input-container')) {
        setupTimeInputs();
    }

    // Determine the current page's HTML file name
    const currentPagePath = window.location.pathname.split('/').pop();
    const config = pageConfig[currentPagePath];

    if (config) {
        // Explicitly show the current page's main content div (e.g., #page-home, #page-commitments)
        const currentPageElement = document.getElementById(config.id);
        if (currentPageElement) {
            currentPageElement.style.display = 'block'; // Make sure the page content is visible
        }

        // Set progress header and title for the current page
        if (progressHeader && progressBar && progressTitle) {
            if (config.progress > 0) {
                progressHeader.style.display = 'block';
                progressBar.style.width = `${config.progress}%`;
                progressTitle.textContent = config.title;
            } else {
                progressHeader.style.display = 'none';
            }
        }

        // Render lists or timetable based on the current page
        if (config.id === 'page-commitments') {
            renderCommitments();
        } else if (config.id === 'page-tasks') {
            renderTasks();
        } else if (config.id === 'page-output') {
            const storedSchedule = localStorage.getItem('lastSchedule');
            if (storedSchedule) {
                try {
                    const lastSchedule = JSON.parse(storedSchedule);
                    renderTimetable(lastSchedule);
                } catch (e) {
                    console.error("Error parsing stored schedule:", e);
                    showError("Failed to load your timetable. Please regenerate it.");
                }
            } else {
                if(timetableGrid) timetableGrid.innerHTML = '<p class="text-center col-span-8 p-10 text-slate-500">Go back and generate a schedule to see your timetable.</p>'
            }

            // Attach download listener ONCE when the output page loads
            if (downloadPngBtn && typeof html2canvas !== 'undefined') {
                downloadPngBtn.addEventListener('click', () => {
                    const targetElement = weeklyView.style.display !== 'none' ? weeklyView : monthlyView;
                     if (!targetElement) {
                        showError("No timetable view is active for download.");
                        return;
                    }

                    // Temporarily increase size for better quality screenshot
                    const originalWidth = targetElement.style.width;
                    targetElement.style.width = '1200px';

                    html2canvas(targetElement, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#f8fafc' // Set a background color
                    }).then(canvas => {
                        const link = document.createElement('a');
                        link.download = 'timetable.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                        // Restore original size
                        targetElement.style.width = originalWidth;
                    }).catch(err => {
                        console.error("Error generating PNG:", err);
                        showError("Failed to generate PNG. Please try again.");
                         // Restore original size even if it fails
                        targetElement.style.width = originalWidth;
                    });
                });
            }
        }
    } else {
        // For homepage.html or if app.js is loaded on an unknown page
        if (progressHeader) {
             progressHeader.style.display = 'none';
        }
        // If the current page is homepage.html (or index.html or empty path), ensure its content is visible
        const homePath = currentPagePath === 'homepage.html' || currentPagePath === '' || currentPagePath === 'index.html';
        if (homePath) {
             const homePageElement = document.getElementById('page-home');
             if (homePageElement) {
                 homePageElement.style.display = 'block';
             }
        }
    }
};