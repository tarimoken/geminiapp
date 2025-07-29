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
        '7th':  { name: 'Dominant 7th', intervals: [10], degrees: ['♭7'], notation: '7' },
        'M7th': { name: 'Major 7th', intervals: [11], degrees: ['7'], notation: 'M7' },
        'b9':   { name: 'Flat 9th', intervals: [1], degrees: ['♭9'], notation: '(♭9)' },
        '9':    { name: '9th', intervals: [2], degrees: ['9'], notation: '9' },
        '#9':   { name: 'Sharp 9th', intervals: [3], degrees: ['♯9'], notation: '(♯9)' },
        '11':   { name: '11th', intervals: [5], degrees: ['11'], notation: '11' },
        '#11':  { name: 'Sharp 11th', intervals: [6], degrees: ['♯11'], replaces: 5, notation: '(♯11)' },
        'b13':  { name: 'Flat 13th', intervals: [8], degrees: ['♭13'], replaces: 5, notation: '(♭13)' },
        '13th': { name: '13th', intervals: [9], degrees: ['13'], notation: '13' },
    };
    
    const SCALES = {
        majorPentatonic: { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
        minorPentatonic: { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
    };

    const DIATONIC_PATTERNS = {
        major: { intervals: [0, 2, 4, 5, 7, 9, 11], types: ['Maj', 'min', 'min', 'Maj', 'Maj', 'min', 'dim'] },
        minor: { intervals: [0, 2, 3, 5, 7, 8, 10], types: ['min', 'dim', 'Maj', 'min', 'min', 'Maj', 'Maj'] }
    };
    
    const ACTIVE_CLASS_MAP = {
        chordType: 'active-type',
        tensions: 'active-tension'
    };

    // --- UI ELEMENT REFERENCES ---
    const fretboardContainer = document.getElementById('fretboard-container');
    const fullChordNameDisplay = document.getElementById('full-chord-name-display');
    const chordTypeSelector = document.getElementById('chord-type-selector');
    const tensionSelector = document.getElementById('tension-selector');
    const bassNoteSelector = document.getElementById('bass-note-selector');
    const majorPentaToggle = document.getElementById('major-penta-toggle');
    const minorPentaToggle = document.getElementById('minor-penta-toggle');
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

    let fretboardGrid = [];
    let currentChordPreset = [];
    let savedProgressions = {};

    // --- STATE MANAGEMENT ---
    let state = {
        rootNote: null, chordType: null, tensions: [], bassNote: null,
        showMajorPenta: false, showMinorPenta: false, displayAsDegrees: false
    };

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
                fretCell.addEventListener('click', () => handleFretClick(noteIndex));
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
        const tensions = ['7th', 'M7th', 'b9', '9', '#9', '11', '#11', 'b13', '13th'];
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
        saveProgressionButton.addEventListener('click', saveProgression);
        progressionSelector.addEventListener('change', loadProgression);
        deleteProgressionButton.addEventListener('click', deleteProgression);
        clearProgressionButton.addEventListener('click', clearCurrentProgression);
        diatonicKeySelector.addEventListener('change', renderDiatonicChords);
        diatonicModeSelector.addEventListener('change', renderDiatonicChords);
    }
    
    function handleFretClick(noteIndex) {
        const newRootNote = NOTES[noteIndex];
        state.rootNote = state.rootNote === newRootNote ? null : newRootNote;
        updateControlsFromState();
        updateDisplay();
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
        state = { rootNote: null, chordType: null, tensions: [], bassNote: null, showMajorPenta: false, showMinorPenta: false, displayAsDegrees: false };
        updateControlsFromState();
        updateDisplay();
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
        if (saved) { state = JSON.parse(JSON.stringify(saved.state)); updateControlsFromState(); updateDisplay(); }
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
                btn.className = 'saved-chord-btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow transition-colors';
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
        
        if (!isRootSelected) return;

        const rootNoteIndex = NOTES.indexOf(state.rootNote);
        if (rootNoteIndex === -1) return;
        if (state.showMajorPenta) highlightScale(calculateScaleNotes(rootNoteIndex, 'majorPentatonic'), 'major-penta');
        if (state.showMinorPenta) highlightScale(calculateScaleNotes(rootNoteIndex, 'minorPentatonic'), 'minor-penta');
        const chordData = calculateChord(state.chordType, state.tensions);
        const chordNoteMap = {};
        chordData.intervals.forEach((interval, i) => { const noteIndex = (rootNoteIndex + interval) % 12; chordNoteMap[noteIndex] = chordData.degrees[i]; });
        highlightChord(chordNoteMap, rootNoteIndex);
        if (state.bassNote) {
            const bassNoteIndex = NOTES.indexOf(state.bassNote);
            if (bassNoteIndex !== -1) highlightBassNote(bassNoteIndex);
        }
    }

    function getDegreeName(noteIndex, rootIndex) { return DEGREE_NAMES[(noteIndex - rootIndex + 12) % 12]; }
    
    function clearAndResetBoard() {
        const rootNoteIndex = state.rootNote ? NOTES.indexOf(state.rootNote) : -1;
        for (let s = 0; s < STRING_COUNT; s++) {
            for (let f = 0; f <= FRET_COUNT; f++) {
                if (!fretboardGrid[s] || !fretboardGrid[s][f]) continue;
                const cell = fretboardGrid[s][f];
                const highlights = cell.element.querySelectorAll('.highlight-circle, .scale-highlight');
                highlights.forEach(h => h.remove());
                if (state.displayAsDegrees && rootNoteIndex !== -1) { cell.noteDisplay.innerHTML = getDegreeName(cell.noteIndex, rootNoteIndex); } 
                else { cell.noteDisplay.innerHTML = NOTES[cell.noteIndex]; }
                cell.noteDisplay.className = 'note-display';
            }
        }
    }
    
    function calculateChord(type, tensions) {
        let chord = { intervals: [], degrees: [] };
        const baseChord = type ? CHORD_INTERVALS[type] : { intervals: [0], degrees: ['R'] };
        chord.intervals = [...(baseChord.intervals || [0])];
        chord.degrees = [...(baseChord.degrees || ['R'])];
        
        (tensions || []).forEach(tensionKey => {
            const tension = CHORD_INTERVALS[tensionKey];
            if (!tension || !tension.intervals) return;
            let replaced = false;
            if (tension.replaces) {
                const degreeToReplace = tension.replaces === 3 ? '3' : '5';
                const degreeIndex = chord.degrees.findIndex(d => d.includes(degreeToReplace));
                if (degreeIndex !== -1) { chord.intervals[degreeIndex] = tension.intervals[0]; chord.degrees[degreeIndex] = tension.degrees[0]; replaced = true; }
            }
            if (!replaced) { chord.intervals.push(...tension.intervals); chord.degrees.push(...tension.degrees); }
        });
        if (!type && (!tensions || tensions.length === 0)) return { intervals: [0], degrees: ['R'] };
        return chord;
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
         const TENSION_DEGREE_NAMES = ['♭7', '7', '♭9', '9', '♯9', '11', '♯11', '♭13', '13', '6'];
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
        for (let s = 4; s <= 5; s++) {
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
        if (currentState.chordType) {
            name += CHORD_INTERVALS[currentState.chordType]?.notation || '';
        }
        
        const tensionOrder = ['7th', 'M7th', 'b9', '9', '#9', '11', '#11', 'b13', '13th'];
        const sortedTensions = (currentState.tensions || []).sort((a, b) => tensionOrder.indexOf(a) - tensionOrder.indexOf(b));

        sortedTensions.forEach(t => {
            name += CHORD_INTERVALS[t]?.notation || '';
        });

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

    // --- START THE APP ---
    initialize();
});
</script>
</body>
</html>
