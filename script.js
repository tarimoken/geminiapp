document.addEventListener('DOMContentLoaded', () => {
    // --- DATA DEFINITIONS ---
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const DEGREE_NAMES = ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];
    let FRET_COUNT = 15;
    const STRING_COUNT = 6;
    const TUNING = [4, 9, 2, 7, 11, 4].reverse(); // EADGBe

    const CHORD_INTERVALS = {
        'Maj':  { name: 'Major', intervals: [0, 4, 7], degrees: ['R', '3', '5'], notation: ''},
        'min':  { name: 'Minor', intervals: [0, 3, 7], degrees: ['R', '♭3', '5'], notation: 'm'},
        'dim':  { name: 'Diminished', intervals: [0, 3, 6], degrees: ['R', '♭3', '♭5'], notation: 'dim'},
        'aug':  { name: 'Augmented', intervals: [0, 4, 8], degrees: ['R', '3', '♯5'], notation: 'aug'},
        'sus2': { name: 'Suspended 2', intervals: [0, 2, 7], degrees: ['R', '2', '5'], replaces: 3, notation: 'sus2' },
        'sus4': { name: 'Suspended 4', intervals: [0, 5, 7], degrees: ['R', '4', '5'], replaces: 3, notation: 'sus4' },
        '7':    { name: 'Dominant 7th', intervals: [0, 4, 7, 10], degrees: ['R', '3', '5', '♭7'], notation: '7' },
        'M7':   { name: 'Major 7th', intervals: [0, 4, 7, 11], degrees: ['R', '3', '5', '7'], notation: 'M7' },
        'm7':   { name: 'Minor 7th', intervals: [0, 3, 7, 10], degrees: ['R', '♭3', '5', '♭7'], notation: 'm7' },
        'm7b5': { name: 'Minor 7th flat 5', intervals: [0, 3, 6, 10], degrees: ['R', '♭3', '♭5', '♭7'], notation: 'm7(♭5)' },
        'dim7': { name: 'Diminished 7th', intervals: [0, 3, 6, 9], degrees: ['R', '♭3', '♭5', '♭♭7'], notation: 'dim7' },
        'add9': { name: 'Add 9', intervals: [0, 2, 4, 7], degrees: ['R', '2', '3', '5'], notation: 'add9' },
        'madd9':{ name: 'Minor Add 9', intervals: [0, 2, 3, 7], degrees: ['R', '2', '♭3', '5'], notation: 'm(add9)' },
        '7b9':  { name: '7th flat 9', intervals: [0, 1, 4, 7, 10], degrees: ['R', '♭9', '3', '5', '♭7'], notation: '7(♭9)'},
        'm7(9)':{ name: 'Minor 7th (9)', intervals: [0, 2, 3, 7, 10], degrees: ['R', '9', '♭3', '5', '♭7'], notation: 'm7(9)' },
    };
    
    const SCALES = {
        majorPentatonic: { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
        minorPentatonic: { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
        blues: { name: 'Blues Scale', intervals: [0, 3, 5, 6, 7, 10] },
    };

    const DIATONIC_PATTERNS = {
        major: { intervals: [0, 2, 4, 5, 7, 9, 11], types: ['Maj', 'min', 'min', 'Maj', 'Maj', 'min', 'dim'] },
        minor: { intervals: [0, 2, 3, 5, 7, 8, 10], types: ['min', 'dim', 'Maj', 'min', 'min', 'Maj', 'Maj'] }
    };
    
    const ACTIVE_CLASS_MAP = {
        chordType: 'active-type',
        tensions: 'active-tension'
    };
    
    const KEY_NOTE_DISPLAY_MODE = {
        'F': 'flats', 'Bb': 'flats', 'Eb': 'flats', 'Ab': 'flats', 'Db': 'flats', 'Gb': 'flats', 'Cb': 'flats',
        'A#': 'flats', 'D#': 'flats', 'G#': 'flats', 'C#': 'flats', 'F#': 'flats', 
        'C': 'sharps', 'G': 'sharps', 'D': 'sharps', 'A': 'sharps', 'E': 'sharps', 'B': 'sharps',
    };

    // --- UI ELEMENT REFERENCES ---
    const fretboardContainer = document.getElementById('fretboard-container');
    const fullChordNameDisplay = document.getElementById('full-chord-name-display');
    const chordTypeSelector = document.getElementById('chord-type-selector');
    const tensionSelector = document.getElementById('tension-selector');
    const bassNoteSelector = document.getElementById('bass-note-selector');
    const majorPentaToggle = document.getElementById('major-penta-toggle');
    const minorPentaToggle = document.getElementById('minor-penta-toggle');
    const bluesScaleToggle = document.getElementById('blues-scale-toggle');
    const resetButton = document.getElementById('reset-button');
    const fretCountInput = document.getElementById('fret-count-input');
    const degreeDisplayToggle = document.getElementById('degree-display-toggle');
    const degreeToggleLabel = document.getElementById('degree-toggle-label');
    const saveChordButton = document.getElementById('save-chord-button');
    const savedChordsContainer = document.getElementById('saved-chords-container');
    const presetsPlaceholder = document.getElementById('presets-placeholder');
    const progressionNameInput = document.getElementById('progression-name-input');
    const saveProgressionButton = document.getElementById('save-progression-button');
    const progressionSelector = document.getElementById('progression-selector');
    const deleteProgressionButton = document.getElementById('delete-progression-button');
    const clearProgressionButton = document.getElementById('clear-progression-button');
    const diatonicKeySelector = document.getElementById('diatonic-key-selector');
    const diatonicModeSelector = document.getElementById('diatonic-mode-selector');
    const diatonicChordsContainer = document.getElementById('diatonic-chords-container');
    const reverseLookupToggle = document.getElementById('reverse-lookup-toggle');
    const saveReverseChordButton = document.getElementById('save-reverse-chord-button');
    const normalControls = document.getElementById('normal-controls');
    const reverseLookupControls = document.getElementById('reverse-lookup-controls');
    const presetsContainer = document.getElementById('presets-container');


    let fretboardGrid = [];
    let currentChordPreset = [];
    let savedProgressions = {};

    // --- STATE MANAGEMENT ---
    let state = {
        rootNote: null, chordType: null, tensions: [], bassNote: null,
        showMajorPenta: false, showMinorPenta: false, showBlues: false, displayAsDegrees: false
    };
    let isReverseLookupMode = false;
    let selectedNotesForLookup = [];
    let identifiedChordState = null;

    // --- INITIALIZATION ---
    function initialize() {
        loadProgressionsFromStorage();
        createFretboard();
        createControlButtons();
        setupDiatonicPanel();
        addEventListeners();
        initializeSortable();
        renderProgressionSelector();
        updateControlsFromState();
        updateDisplay();
        // Move presets container for UI switching
        reverseLookupControls.appendChild(presetsContainer);
    }
    
    function initializeSortable() {
        new Sortable(savedChordsContainer, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: (evt) => {
                const element = currentChordPreset.splice(evt.oldIndex, 1)[0];
                currentChordPreset.splice(evt.newIndex, 0, element);
            }
        });
    }

    function createFretboard() {
        fretboardContainer.innerHTML = '';
        fretboardGrid = [];
        const scrollWrapper = document.createElement('div');
        scrollWrapper.className = 'fretboard-scroll-wrapper overflow-x-auto pb-2';
        const board = document.createElement('div');
        board.className = 'grid gap-y-1 min-w-[700px]';
        board.style.gridTemplateRows = `repeat(${STRING_COUNT}, 24px)`;

        for (let s = 0; s < STRING_COUNT; s++) {
            const stringRow = document.createElement('div');
            stringRow.className = 'grid relative';
            stringRow.style.gridTemplateColumns = `repeat(${FRET_COUNT + 1}, 1fr)`;
            fretboardGrid[s] = [];
            for (let f = 0; f <= FRET_COUNT; f++) {
                const fretCell = document.createElement('div');
                fretCell.className = 'fret flex justify-center items-center relative';
                if (f === 0) { fretCell.style.borderRightWidth = '6px'; fretCell.style.borderRightColor = '#6b7280'; }
                const noteIndex = (TUNING[s] + f) % 12;
                const noteDisplay = document.createElement('div');
                noteDisplay.className = 'note-display';
                noteDisplay.textContent = NOTES[noteIndex];
                fretCell.appendChild(noteDisplay);
                stringRow.appendChild(fretCell);
                fretboardGrid[s][f] = { element: fretCell, noteDisplay: noteDisplay, noteIndex: noteIndex };
                fretCell.addEventListener('click', () => handleFretClick(f, s));
            }
            const stringLine = document.createElement('div');
            stringLine.className = 'string absolute top-1/2 -translate-y-1/2';
            stringLine.style.height = `${s * 0.4 + 1}px`;
            const fretWidthPercentage = 100 / (FRET_COUNT + 1);
            stringLine.style.left = `${fretWidthPercentage / 2}%`; stringLine.style.width = `${100 - fretWidthPercentage}%`;
            stringRow.appendChild(stringLine);
            board.appendChild(stringRow);
        }
        scrollWrapper.appendChild(board);

        const fretNumberRow = document.createElement('div');
        fretNumberRow.className = 'grid mt-2 min-w-[700px]';
        fretNumberRow.style.gridTemplateColumns = `repeat(${FRET_COUNT + 1}, 1fr)`;

        const MARKER_FRETS = [3, 5, 7, 9, 15, 17, 19];
        const DOUBLE_MARKER_FRET = 12;

        for (let f = 0; f <= FRET_COUNT; f++) {
            const fretNumContainer = document.createElement('div');
            fretNumContainer.className = 'text-center text-xs sm:text-sm font-bold text-gray-700 h-8 flex flex-col items-center justify-start';

            const markerContainer = document.createElement('div');
            markerContainer.className = 'h-4 flex items-center justify-center gap-x-1.5';

            if (MARKER_FRETS.includes(f)) {
                const marker = document.createElement('div');
                marker.className = 'w-2 h-2 bg-gray-800 rounded-full';
                markerContainer.appendChild(marker);
            } else if (f === DOUBLE_MARKER_FRET) {
                const marker1 = document.createElement('div');
                marker1.className = 'w-2 h-2 bg-gray-800 rounded-full';
                const marker2 = document.createElement('div');
                marker2.className = 'w-2 h-2 bg-gray-800 rounded-full';
                markerContainer.appendChild(marker1);
                markerContainer.appendChild(marker2);
            }
            
            const fretNum = document.createElement('span');
            fretNum.textContent = f;

            fretNumContainer.appendChild(markerContainer);
            fretNumContainer.appendChild(fretNum);
            fretNumberRow.appendChild(fretNumContainer);
        }
        scrollWrapper.appendChild(fretNumberRow);
        fretboardContainer.appendChild(scrollWrapper);
    }

    function createControlButtons() {
        const rootNotes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
        bassNoteSelector.innerHTML = '<option value="">なし</option>';
        rootNotes.forEach(note => {
            const option = document.createElement('option');
            option.value = note;
            option.textContent = note;
            bassNoteSelector.appendChild(option);
        });

        const chordTypes = ['Maj', 'min', 'dim', 'aug', 'sus2', 'sus4'];
        createButtons(chordTypeSelector, chordTypes, 'chordType', 'single');
        const tensions = ['7', 'M7', 'm7', 'm7b5', 'dim7', 'add9', 'madd9'];
        createButtons(tensionSelector, tensions, 'tensions', 'multiple');
    }

    function createButtons(container, items, stateKey, selectionType) {
        container.innerHTML = '';
        items.forEach(item => {
            const button = document.createElement('button');
            button.className = 'control-btn border border-gray-300 rounded py-1 text-xs text-gray-700 hover:bg-gray-100';
            button.textContent = item; button.dataset.value = item; button.dataset.key = stateKey; button.dataset.type = selectionType;
            container.appendChild(button);
        });
    }

    function addEventListeners() {
        document.getElementById('controls-container').addEventListener('click', (e) => {
            if (e.target.matches('.control-btn')) {
                handleButtonClick(e);
            }
        });
        bassNoteSelector.addEventListener('change', (e) => {
            state.bassNote = e.target.value || null;
            updateControlsFromState();
            updateDisplay();
        });
        majorPentaToggle.addEventListener('change', (e) => { state.showMajorPenta = e.target.checked; updateDisplay(); });
        minorPentaToggle.addEventListener('change', (e) => { state.showMinorPenta = e.target.checked; updateDisplay(); });
        bluesScaleToggle.addEventListener('change', (e) => { state.showBlues = e.target.checked; updateDisplay(); });
        degreeDisplayToggle.addEventListener('change', (e) => { state.displayAsDegrees = e.target.checked; updateDisplay(); });
        resetButton.addEventListener('click', resetAll);
        fretCountInput.addEventListener('change', (e) => {
            const newCount = parseInt(e.target.value, 10);
            if (isNaN(newCount) || newCount < 12 || newCount > 24) { e.target.value = FRET_COUNT; return; }
            FRET_COUNT = newCount;
            createFretboard();
            updateDisplay();
        });
        saveChordButton.addEventListener('click', saveChordToPreset);
        saveReverseChordButton.addEventListener('click', saveReverseChord);
        saveProgressionButton.addEventListener('click', saveProgression);
        progressionSelector.addEventListener('change', loadProgression);
        deleteProgressionButton.addEventListener('click', deleteProgression);
        clearProgressionButton.addEventListener('click', clearCurrentProgression);
        diatonicKeySelector.addEventListener('change', renderDiatonicChords);
        diatonicModeSelector.addEventListener('change', renderDiatonicChords);
        reverseLookupToggle.addEventListener('click', toggleReverseLookupMode);
    }
    
    function handleFretClick(fret, string) {
        const clickedCell = fretboardGrid[string][fret];
        if (clickedCell.element.classList.contains('disabled')) return;

        const noteIndex = clickedCell.noteIndex;

        if (isReverseLookupMode) {
            const noteId = `${string}-${fret}`;
            const existingNote = selectedNotesForLookup.find(n => n.id === noteId);

            if (fret === 0) {
                if (!existingNote) {
                    selectedNotesForLookup.push({ id: noteId, string, fret, noteIndex, status: 'selected' });
                } else if (existingNote.status === 'selected') {
                    existingNote.status = 'muted';
                } else { // status is 'muted'
                    selectedNotesForLookup = selectedNotesForLookup.filter(n => n.id !== noteId);
                }
            } else {
                if (existingNote) {
                    selectedNotesForLookup = selectedNotesForLookup.filter(n => n.id !== noteId);
                } else {
                    // Remove any other selections on the same string
                    selectedNotesForLookup = selectedNotesForLookup.filter(n => n.string !== string);
                    selectedNotesForLookup.push({ id: noteId, string, fret, noteIndex, status: 'selected' });
                }
            }
            updateReverseLookupFretboard();
        } else {
            const newRootNote = NOTES[noteIndex];
            state.rootNote = state.rootNote === newRootNote ? null : newRootNote;
            updateControlsFromState();
            updateDisplay();
        }
    }

    function handleButtonClick(e) {
        const { key, value, type } = e.target.dataset;
        if (!key) return;

        if (type === 'single') {
            state[key] = state[key] === value ? null : value;
        } else if (type === 'multiple') {
            if (!Array.isArray(state[key])) state[key] = [];
            const index = state[key].indexOf(value);
            if (index > -1) {
                state[key].splice(index, 1);
            } else {
                state[key].push(value);
            }
        }
        updateControlsFromState();
        updateDisplay();
    }

    function resetAll() {
        state = { rootNote: null, chordType: null, tensions: [], bassNote: null, showMajorPenta: false, showMinorPenta: false, showBlues: false, displayAsDegrees: false };
        if (isReverseLookupMode) {
            selectedNotesForLookup = [];
            updateReverseLookupFretboard();
            fullChordNameDisplay.textContent = "指板を選択";
            fullChordNameDisplay.classList.remove('text-lg', 'text-red-500');
            fullChordNameDisplay.classList.add('text-base', 'text-gray-500');
        } else {
            updateControlsFromState();
            updateDisplay();
        }
    }
    
    function saveChordToPreset() {
        const chordName = generateChordName(state);
        if (!state.rootNote || chordName === '--') { 
            alert('コードをプリセットに追加するには、まずフレットボードをクリックしてルートノートを選択してください。'); 
            return; 
        }
        const newSavedChord = { id: Date.now().toString(), name: chordName, state: JSON.parse(JSON.stringify(state)) };
        currentChordPreset.push(newSavedChord);
        renderCurrentProgression();
    }

    function recallChordState(id) {
        const saved = currentChordPreset.find(c => c.id === id);
        if (saved) { 
            if (isReverseLookupMode) toggleReverseLookupMode();
            state = JSON.parse(JSON.stringify(saved.state)); 
            updateControlsFromState(); 
            updateDisplay(); 
        }
    }
    
    function deleteChordFromPreset(id) {
        currentChordPreset = currentChordPreset.filter(c => c.id !== id);
        renderCurrentProgression();
    }
    
    function renderCurrentProgression() {
        savedChordsContainer.innerHTML = '';
        if (currentChordPreset.length === 0) { 
            savedChordsContainer.appendChild(presetsPlaceholder);
        } else {
            currentChordPreset.forEach(chord => {
                const btn = document.createElement('div');
                btn.className = 'saved-chord-btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2.5 border border-gray-400 rounded shadow transition-colors text-xs';
                btn.textContent = chord.name; btn.dataset.id = chord.id;
                btn.addEventListener('click', () => recallChordState(chord.id));
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-chord-btn'; deleteBtn.innerHTML = '&times;';
                deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteChordFromPreset(id); });
                btn.appendChild(deleteBtn);
                savedChordsContainer.appendChild(btn);
            });
        }
    }
    
    function saveProgression() {
        const name = progressionNameInput.value.trim();
        if (!name) { alert('進行の名前を入力してください。'); return; }
        if (currentChordPreset.length === 0) { alert('保存するコードがありません。'); return; }
        savedProgressions[name] = JSON.parse(JSON.stringify(currentChordPreset));
        progressionNameInput.value = '';
        saveProgressionsToStorage();
        renderProgressionSelector();
        progressionSelector.value = name;
        deleteProgressionButton.disabled = false;
    }
    
    function loadProgression() {
        const name = progressionSelector.value;
        deleteProgressionButton.disabled = !name;
        if (name && savedProgressions[name]) {
            currentChordPreset = JSON.parse(JSON.stringify(savedProgressions[name]));
            renderCurrentProgression();
        } else if (!name) {
            clearCurrentProgression();
        }
    }

    function deleteProgression() {
        const name = progressionSelector.value;
        if (name && window.confirm(`「${name}」を削除しますか？`)) {
            delete savedProgressions[name];
            saveProgressionsToStorage();
            renderProgressionSelector();
            clearCurrentProgression();
        }
    }

    function clearCurrentProgression() {
        currentChordPreset = [];
        progressionSelector.value = "";
        deleteProgressionButton.disabled = true;
        renderCurrentProgression();
    }

    function renderProgressionSelector() {
        const currentVal = progressionSelector.value;
        progressionSelector.innerHTML = '<option value="">保存した進行を読込...</option>';
        Object.keys(savedProgressions).sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name; option.textContent = name;
            progressionSelector.appendChild(option);
        });
        progressionSelector.value = currentVal;
        deleteProgressionButton.disabled = !progressionSelector.value;
    }

    function saveProgressionsToStorage() {
        localStorage.setItem('guitarFretboardProgressions', JSON.stringify(savedProgressions));
    }

    function loadProgressionsFromStorage() {
        const stored = localStorage.getItem('guitarFretboardProgressions');
        if (stored) { savedProgressions = JSON.parse(stored); }
    }
    
    function updateControlsFromState() {
        fullChordNameDisplay.textContent = generateChordName(state);
        fullChordNameDisplay.classList.add('text-lg', 'text-red-500');
        fullChordNameDisplay.classList.remove('text-base', 'text-gray-500');
                
        document.querySelectorAll('.control-btn').forEach(btn => {
            const { key, value, type } = btn.dataset;
            const activeClass = ACTIVE_CLASS_MAP[key];
            if (!activeClass) return;

            let shouldBeActive = false;
            if (type === 'single') {
                shouldBeActive = state[key] === value;
            } else {
                shouldBeActive = Array.isArray(state[key]) && state[key].includes(value);
            }
            btn.classList.toggle(activeClass, shouldBeActive);
        });
        
        bassNoteSelector.value = state.bassNote || '';
        majorPentaToggle.checked = state.showMajorPenta;
        minorPentaToggle.checked = state.showMinorPenta;
        bluesScaleToggle.checked = state.showBlues;
        degreeDisplayToggle.checked = state.displayAsDegrees;
    }

    function updateDisplay() {
        const isRootSelected = !!state.rootNote;
        degreeDisplayToggle.disabled = !isRootSelected;
        degreeToggleLabel.classList.toggle('toggle-label-disabled', !isRootSelected);
        if (!isRootSelected && state.displayAsDegrees) {
            state.displayAsDegrees = false;
            degreeDisplayToggle.checked = false;
        }
        clearAndResetBoard();
        
        if (isReverseLookupMode) return;

        if (!isRootSelected) return;

        const rootNoteIndex = NOTES.indexOf(state.rootNote) !== -1 ? NOTES.indexOf(state.rootNote) : NOTES_FLAT.indexOf(state.rootNote);
        if (rootNoteIndex === -1) return;
        if (state.showMajorPenta) highlightScale(calculateScaleNotes(rootNoteIndex, 'majorPentatonic'), 'major-penta');
        if (state.showMinorPenta) highlightScale(calculateScaleNotes(rootNoteIndex, 'minorPentatonic'), 'minor-penta');
        if (state.showBlues) highlightScale(calculateScaleNotes(rootNoteIndex, 'blues'), 'blues-scale');
        const chordData = calculateChord(state.chordType, state.tensions);
        const chordNoteMap = {};
        chordData.intervals.forEach((interval) => { 
            const noteIndex = (rootNoteIndex + interval) % 12;
            chordNoteMap[noteIndex] = getDegreeName(noteIndex, rootNoteIndex);
        });
        highlightChord(chordNoteMap, rootNoteIndex);
        if (state.bassNote) {
            const bassNoteIndex = NOTES.indexOf(state.bassNote) !== -1 ? NOTES.indexOf(state.bassNote) : NOTES_FLAT.indexOf(state.bassNote);
            if (bassNoteIndex !== -1) highlightBassNote(bassNoteIndex);
        }
    }

    function getDegreeName(noteIndex, rootIndex) { 
        if (rootIndex === -1) return NOTES[noteIndex];
        return DEGREE_NAMES[(noteIndex - rootIndex + 12) % 12];
    }
    
    function clearAndResetBoard() {
        let displayNotes = NOTES; // Default to sharps
        if (!isReverseLookupMode && state.rootNote && KEY_NOTE_DISPLAY_MODE[state.rootNote] === 'flats') {
            displayNotes = NOTES_FLAT;
        }

        const rootNoteIndex = state.rootNote ? (NOTES.indexOf(state.rootNote) !== -1 ? NOTES.indexOf(state.rootNote) : NOTES_FLAT.indexOf(state.rootNote)) : -1;

        for (let s = 0; s < STRING_COUNT; s++) {
            for (let f = 0; f <= FRET_COUNT; f++) {
                if (!fretboardGrid[s] || !fretboardGrid[s][f]) continue;
                const cell = fretboardGrid[s][f];
                cell.element.classList.remove('reverse-lookup-selected', 'reverse-lookup-muted', 'disabled');
                const highlights = cell.element.querySelectorAll('.highlight-circle, .scale-highlight');
                highlights.forEach(h => h.remove());
                if (state.displayAsDegrees && rootNoteIndex !== -1) { 
                    cell.noteDisplay.innerHTML = getDegreeName(cell.noteIndex, rootNoteIndex);
                } else {
                    cell.noteDisplay.innerHTML = displayNotes[cell.noteIndex];
                }
            }
        }
    }
    
    function calculateChord(type, tensions) {
        let intervals = new Set();
        
        // Start with base chord
        if (type) {
            CHORD_INTERVALS[type].intervals.forEach(i => intervals.add(i));
        } else {
            intervals.add(0);
        }

        // Add tensions
        (tensions || []).forEach(tensionKey => {
            const tension = CHORD_INTERVALS[tensionKey];
            if (tension) {
                tension.intervals.forEach(i => intervals.add(i));
            }
        });

        // Resolve 3rd conflict: type wins
        if (type && (type.includes('min') || type.includes('dim'))) {
            if (intervals.has(4)) intervals.delete(4);
        } else if (type && (type.includes('Maj') || type.includes('aug'))) {
            if (intervals.has(3)) intervals.delete(3);
        }
        
        // sus chords always remove any 3rd
        if (type && type.includes('sus')) {
             intervals.delete(3);
             intervals.delete(4);
        }

        const finalIntervals = Array.from(intervals).sort((a, b) => a - b);
        
        const rootNoteIndex = state.rootNote ? (NOTES.indexOf(state.rootNote) !== -1 ? NOTES.indexOf(state.rootNote) : NOTES_FLAT.indexOf(state.rootNote)) : -1;
        const finalDegrees = finalIntervals.map(i => DEGREE_NAMES[(i - rootNoteIndex + 12) % 12]);
        
        return { intervals: finalIntervals, degrees: finalDegrees };
    }

    function calculateScaleNotes(rootIndex, scaleType) {
        const scale = SCALES[scaleType];
        if (!scale) return [];
        return scale.intervals.map(interval => (rootIndex + interval) % 12);
    }

    function highlightScale(noteIndices, className) {
        for (let s = 0; s < STRING_COUNT; s++) {
            for (let f = 0; f <= FRET_COUNT; f++) {
                if (!fretboardGrid[s] || !fretboardGrid[s][f]) continue;
                const cell = fretboardGrid[s][f];
                if (noteIndices.includes(cell.noteIndex)) {
                     const scaleMarker = document.createElement('div');
                     scaleMarker.className = `scale-highlight ${className}`;
                     cell.element.insertBefore(scaleMarker, cell.noteDisplay);
                }
            }
        }
    }

    function highlightChord(noteMap, rootNoteIndex) {
         const TENSION_DEGREE_NAMES = ['♭7', '7', '9', '11', '13', '♭9'];
         const noteIndicesToHighlight = Object.keys(noteMap).map(n => parseInt(n));
         for (let s = 0; s < STRING_COUNT; s++) {
            for (let f = 0; f <= FRET_COUNT; f++) {
                if (!fretboardGrid[s] || !fretboardGrid[s][f]) continue;
                const cell = fretboardGrid[s][f];
                if (noteIndicesToHighlight.includes(cell.noteIndex)) {
                     cell.noteDisplay.innerHTML = ''; 
                     const highlight = document.createElement('div');
                     highlight.className = 'highlight-circle';
                     const degreeText = noteMap[cell.noteIndex];

                     if (cell.noteIndex === rootNoteIndex) {
                        highlight.classList.add('root');
                        highlight.textContent = 'R'; 
                     } else if (TENSION_DEGREE_NAMES.some(t => degreeText.includes(t))) {
                        highlight.classList.add('tension');
                        highlight.textContent = degreeText;
                     } else { 
                        highlight.classList.add('degree');
                        highlight.textContent = degreeText;
                     }
                     cell.noteDisplay.appendChild(highlight);
                }
            }
        }
    }

    function highlightBassNote(bassNoteIndex) {
        for (let s = 0; s < STRING_COUNT; s++) {
            for (let f = 0; f <= FRET_COUNT; f++) {
                if (!fretboardGrid[s] || !fretboardGrid[s][f]) continue;
                const cell = fretboardGrid[s][f];
                if (cell.noteIndex === bassNoteIndex) {
                    let highlight = cell.noteDisplay.querySelector('.highlight-circle');
                    if (highlight) {
                        highlight.style.border = '3px solid #22c55e';
                        highlight.style.width = '28px';
                        highlight.style.height = '28px';
                    } else {
                        cell.noteDisplay.innerHTML = '';
                        highlight = document.createElement('div');
                        highlight.className = 'highlight-circle bass';
                        highlight.textContent = 'B';
                        highlight.style.width = '28px';
                        highlight.style.height = '28px';
                        highlight.style.fontSize = '0.8rem';
                        cell.noteDisplay.appendChild(highlight);
                    }
                }
            }
        }
    }
    
    function generateChordName(currentState) {
        if (!currentState.rootNote) return '--';
        let name = currentState.rootNote;
        
        let baseNotation = '';
        if(currentState.chordType) {
            baseNotation = CHORD_INTERVALS[currentState.chordType]?.notation || '';
        }
        
        const tensionOrder = ['7', 'M7', 'm7', 'm7b5', 'dim7', 'add9', 'madd9', 'm7(9)', '7b9'];
        const sortedTensions = (currentState.tensions || []).sort((a, b) => tensionOrder.indexOf(a) - tensionOrder.indexOf(b));

        let tensionNotation = '';
        sortedTensions.forEach(t => {
            const notation = CHORD_INTERVALS[t]?.notation;
            if (notation && !baseNotation.includes(notation.replace(/m/g, ''))) {
                 tensionNotation += notation;
            }
        });
        
        if (baseNotation === 'm' && tensionNotation.startsWith('m')) {
             name += tensionNotation;
        } else {
            name += baseNotation + tensionNotation;
        }


        if (currentState.bassNote && currentState.bassNote !== currentState.rootNote) {
            name += `/${currentState.bassNote}`;
        }
        return name;
    }
    
    // --- DIATONIC FUNCTIONS ---
    function setupDiatonicPanel() {
        NOTES.forEach(note => {
            const option = document.createElement('option');
            option.value = note;
            option.textContent = note;
            diatonicKeySelector.appendChild(option);
        });
        renderDiatonicChords();
    }

    function renderDiatonicChords() {
        diatonicChordsContainer.innerHTML = '';
        const key = diatonicKeySelector.value;
        const mode = diatonicModeSelector.value;
        const keyIndex = NOTES.indexOf(key);
        if (keyIndex === -1) return;

        const pattern = DIATONIC_PATTERNS[mode];
        pattern.intervals.forEach((interval, i) => {
            const rootNoteIndex = (keyIndex + interval) % 12;
            const rootNoteName = NOTES[rootNoteIndex];
            const chordType = pattern.types[i];
            
            const btn = document.createElement('button');
            btn.className = 'diatonic-chord-btn border border-gray-400 bg-gray-100 hover:bg-gray-200 rounded py-2 px-3 text-sm font-semibold text-gray-800';
            btn.textContent = `${rootNoteName}${CHORD_INTERVALS[chordType].notation}`;
            btn.addEventListener('click', () => {
                if (isReverseLookupMode) toggleReverseLookupMode();
                state.rootNote = rootNoteName;
                state.chordType = chordType;
                state.tensions = [];
                state.bassNote = null;
                updateControlsFromState();
                updateDisplay();
            });
            diatonicChordsContainer.appendChild(btn);
        });
    }

    // --- REVERSE LOOKUP FUNCTIONS ---
    function toggleReverseLookupMode() {
        isReverseLookupMode = !isReverseLookupMode;
        reverseLookupToggle.classList.toggle('active-lookup', isReverseLookupMode);
        
        resetAll();
        
        normalControls.classList.toggle('hidden', isReverseLookupMode);
        reverseLookupControls.classList.toggle('hidden', !isReverseLookupMode);
        saveReverseChordButton.classList.toggle('hidden', !isReverseLookupMode);
        saveChordButton.classList.toggle('hidden', isReverseLookupMode);

        if (isReverseLookupMode) {
            fullChordNameDisplay.textContent = "指板を選択";
            fullChordNameDisplay.classList.remove('text-lg', 'text-red-500');
            fullChordNameDisplay.classList.add('text-base', 'text-gray-500');
        }
    }

    function updateReverseLookupFretboard() {
        clearAndResetBoard();

        for (let s = 0; s < STRING_COUNT; s++) {
            const selectedNoteOnString = selectedNotesForLookup.find(n => n.string === s && n.status === 'selected');
            if (selectedNoteOnString && selectedNoteOnString.fret > 0) {
                for (let f = 0; f < selectedNoteOnString.fret; f++) {
                    fretboardGrid[s][f].element.classList.add('disabled');
                }
            }
        }

        selectedNotesForLookup.forEach(note => {
            const cell = fretboardGrid[note.string][note.fret];
            if (note.status === 'selected') {
                cell.element.classList.add('reverse-lookup-selected');
            } else if (note.status === 'muted') {
                cell.element.classList.add('reverse-lookup-muted');
                cell.noteDisplay.textContent = 'X';
            }
        });

        identifyChordFromSelection();
    }

    function identifyChordFromSelection() {
        const uniqueNoteIndexes = [...new Set(selectedNotesForLookup.filter(n => n.status === 'selected').map(n => n.noteIndex))];
        if (uniqueNoteIndexes.length < 2) {
            fullChordNameDisplay.textContent = "音を追加";
            fullChordNameDisplay.classList.remove('text-lg', 'text-red-500');
            fullChordNameDisplay.classList.add('text-sm', 'text-gray-500');
            identifiedChordState = null;
            saveReverseChordButton.disabled = true;
            return;
        }

        const result = findChord(uniqueNoteIndexes);
        if (result) {
            fullChordNameDisplay.textContent = result.name;
            fullChordNameDisplay.classList.add('text-lg', 'text-red-500');
            fullChordNameDisplay.classList.remove('text-sm', 'text-gray-500');
            identifiedChordState = result.state;
            saveReverseChordButton.disabled = false;
        } else {
            fullChordNameDisplay.textContent = "不明なコード";
            fullChordNameDisplay.classList.remove('text-lg', 'text-red-500');
            fullChordNameDisplay.classList.add('text-sm', 'text-gray-500');
            identifiedChordState = null;
            saveReverseChordButton.disabled = true;
        }
    }

    function findChord(noteIndexes) {
        const CHORD_DEFINITIONS = [
            { name: 'm7(9)', state: { chordType: 'min', tensions: ['m7', 'add9'] }, intervals: [0, 2, 3, 7, 10] },
            { name: '7(♭9)', state: { chordType: 'Maj', tensions: ['7', '7b9'] }, intervals: [0, 1, 4, 7, 10] },
            { name: '7', state: { chordType: 'Maj', tensions: ['7'] }, intervals: [0, 4, 7, 10] }, 
            { name: 'M7', state: { chordType: 'Maj', tensions: ['M7'] }, intervals: [0, 4, 7, 11] },
            { name: 'm7', state: { chordType: 'min', tensions: ['m7'] }, intervals: [0, 3, 7, 10] }, 
            { name: 'm7(♭5)', state: { chordType: 'dim', tensions: ['m7b5'] }, intervals: [0, 3, 6, 10] },
            { name: 'dim7', state: { chordType: 'dim', tensions: ['dim7'] }, intervals: [0, 3, 6, 9] }, 
            { name: 'add9', state: { chordType: 'Maj', tensions: ['add9'] }, intervals: [0, 2, 4, 7] },
            { name: 'm(add9)', state: { chordType: 'min', tensions: ['madd9'] }, intervals: [0, 2, 3, 7] }, 
            { name: '', state: { chordType: 'Maj', tensions: [] }, intervals: [0, 4, 7] }, 
            { name: 'm', state: { chordType: 'min', tensions: [] }, intervals: [0, 3, 7] }, 
            { name: 'dim', state: { chordType: 'dim', tensions: [] }, intervals: [0, 3, 6] }, 
            { name: 'aug', state: { chordType: 'aug', tensions: [] }, intervals: [0, 4, 8] }, 
            { name: 'sus2', state: { chordType: 'sus2', tensions: [] }, intervals: [0, 2, 7] }, 
            { name: 'sus4', state: { chordType: 'sus4', tensions: [] }, intervals: [0, 5, 7] },
        ];

        for (const root of noteIndexes) {
            const intervals = noteIndexes.map(note => (note - root + 12) % 12).sort((a, b) => a - b);
            for (const chord of CHORD_DEFINITIONS) {
                if (intervals.length === chord.intervals.length && intervals.every((v, i) => v === chord.intervals[i])) {
                    return {
                        name: `${NOTES[root]}${chord.name}`,
                        state: {
                            rootNote: NOTES[root],
                            ...chord.state,
                        }
                    };
                }
            }
        }
        return null;
    }

    function saveReverseChord() {
        if (identifiedChordState) {
            const finalState = { ...state, ...identifiedChordState, bassNote: null };
            const chordName = generateChordName(finalState);
            const newSavedChord = {
                id: Date.now().toString(),
                name: chordName,
                state: JSON.parse(JSON.stringify(finalState))
            };
            currentChordPreset.push(newSavedChord);
            renderCurrentProgression();
        }
    }

    // --- START THE APP ---
    initialize();
});
