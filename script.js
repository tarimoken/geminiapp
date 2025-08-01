document.addEventListener('DOMContentLoaded', () => {
    // --- DATA DEFINITIONS ---
    const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const NOTES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
    const DEGREE_NAMES = ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];
    let FRET_COUNT = 15;
    const STRING_COUNT = 6;
    const TUNING = [4, 9, 2, 7, 11, 4].reverse(); // EADGBe

    const CHORD_INTERVALS = {
        'Maj':  { name: 'Major', intervals: [0, 4, 7], degrees: ['R', '3', '5'], notation: ''},
        'min':  { name: 'Minor', intervals: [0, 3, 7], degrees: ['R', '♭3', '5'], notation: 'm'},
        'dim':  { name: 'Diminished', intervals: [0, 3, 6], degrees: ['R', '♭3', '♭5'], notation: 'dim'},
        'aug':  { name: 'Augmented', intervals: [0, 4, 8], degrees: ['R', '3', '♯5'], notation: 'aug'},
        'sus2': { name: 'Suspended 2', intervals: [0, 2, 7], degrees: ['R', '2', '5'], notation: 'sus2' },
        'sus4': { name: 'Suspended 4', intervals: [0, 5, 7], degrees: ['R', '4', '5'], notation: 'sus4' },
        '7':    { name: 'Dominant 7th', intervals: [0, 4, 7, 10], degrees: ['R', '3', '5', '♭7'], notation: '7' },
        'M7':   { name: 'Major 7th', intervals: [0, 4, 7, 11], degrees: ['R', '3', '5', '7'], notation: 'M7' },
        'm7':   { name: 'Minor 7th', intervals: [0, 3, 7, 10], degrees: ['R', '♭3', '5', '♭7'], notation: 'm7' },
        'm7b5': { name: 'Minor 7th flat 5', intervals: [0, 3, 6, 10], degrees: ['R', '♭3', '♭5', '♭7'], notation: 'm7(♭5)' },
        'dim7': { name: 'Diminished 7th', intervals: [0, 3, 6, 9], degrees: ['R', '♭3', '♭5', '♭♭7'], notation: 'dim7' },
        '6':    { name: 'Major 6th', intervals: [0, 4, 7, 9], degrees: ['R', '3', '5', '6'], notation: '6' },
        'm6':   { name: 'Minor 6th', intervals: [0, 3, 7, 9], degrees: ['R', '♭3', '5', '6'], notation: 'm6' },
        '9':    { name: 'Dominant 9th', intervals: [0, 4, 7, 10, 14], degrees: ['R', '3', '5', '♭7', '9'], notation: '9' },
        'M9':   { name: 'Major 9th', intervals: [0, 4, 7, 11, 14], degrees: ['R', '3', '5', '7', '9'], notation: 'M9' },
        'm9':   { name: 'Minor 9th', intervals: [0, 3, 7, 10, 14], degrees: ['R', '♭3', '5', '♭7', '9'], notation: 'm9' },
        '7s9':  { name: '7th sharp 9', intervals: [0, 4, 7, 10, 15], degrees: ['R', '3', '5', '♭7', '♯9'], notation: '7(♯9)'},
        '7b9':  { name: '7th flat 9', intervals: [0, 4, 7, 10, 13], degrees: ['R', '3', '5', '♭7', '♭9'], notation: '7(♭9)'},
    };

    const SCALES = {
        majorPentatonic: { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
        minorPentatonic: { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
    };

    const DIATONIC_INFO = {
        intervals: {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10]
        },
        types_7th: {
            major: ['M7', 'm7', 'm7', 'M7', '7', 'm7', 'm7b5'],
            minor: ['m7', 'm7b5', 'M7', 'm7', 'm7', 'M7', '7']
        },
        degrees: {
            major: ['I', 'IIm', 'IIIm', 'IV', 'V', 'VIm', 'VIIm-5'],
            minor: ['im', 'iim-5', 'III', 'ivm', 'vm', 'VI', 'VII']
        },
        functions: {
            major: ['tonic', 'subdominant', 'tonic', 'subdominant', 'dominant', 'tonic', 'dominant'],
            minor: ['tonic', 'subdominant', 'tonic', 'subdominant', 'dominant', 'tonic', 'dominant']
        }
    };

    // --- UI ELEMENT REFERENCES ---
    const fretboardContainer = document.getElementById('fretboard-container');
    const fullChordNameDisplay = document.getElementById('full-chord-name-display');
    const combinedChordSelector = document.getElementById('combined-chord-selector');
    const bassNoteSelector = document.getElementById('bass-note-selector');
    const majorPentaToggle = document.getElementById('major-penta-toggle');
    const minorPentaToggle = document.getElementById('minor-penta-toggle');
    const resetButton = document.getElementById('reset-button');
    const fretCountInput = document.getElementById('fret-count-input');
    const degreeDisplayToggle = document.getElementById('degree-display-toggle');
    const degreeToggleLabel = document.getElementById('degree-toggle-label');
    const notationToggle = document.getElementById('notation-toggle');
    const diatonicKeySelector = document.getElementById('diatonic-key-selector');
    const diatonicModeSelectorContainer = document.getElementById('diatonic-mode-selector-container');
    const diatonicChordsContainer = document.getElementById('diatonic-chords-container');
    const reverseLookupToggle = document.getElementById('reverse-lookup-toggle');
    const normalControls = document.getElementById('normal-controls');
    const reverseLookupControls = document.getElementById('reverse-lookup-controls');
    const pianoKeyboardContainer = document.getElementById('piano-keyboard-container');

    let fretboardGrid = [];

    // --- STATE MANAGEMENT ---
    let state = {
        rootNote: null, chordType: null, bassNote: null,
        showMajorPenta: false, showMinorPenta: false, displayAsDegrees: false,
        notationMode: 'sharps',
        diatonicMode: 'major'
    };
    let isReverseLookupMode = false;
    let selectedNotesForLookup = [];
    let identifiedChordState = null;

    // --- INITIALIZATION ---
    function initialize() {
        createPianoKeyboard();
        createFretboard();
        createChordButtons();
        setupDiatonicPanel();
        addEventListeners();
        updateControlsFromState();
        updateDisplay();
    }

    function formatNoteHTML(name) {
        if (!name) return '';
        return name.replace(/([♯♭]|-5)/g, '<span class="accidental">$1</span>');
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

    function createChordButtons() {
        const rootNotes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;
        bassNoteSelector.innerHTML = '<option value="">なし</option>';
        rootNotes.forEach(note => {
            const option = document.createElement('option');
            option.value = note;
            option.textContent = note;
            bassNoteSelector.appendChild(option);
        });

        const buttonOrder = [
            'Maj', 'min', 'm7b5', 'dim7', 'dim', '7', 'M7', 'm7',
            '9', 'M9', 'm9', 'aug', 'sus2', 'sus4', '6', 'm6', '7b9', '7s9'
        ];

        combinedChordSelector.innerHTML = '';
        buttonOrder.forEach(item => {
            const button = document.createElement('button');
            const notation = CHORD_INTERVALS[item]?.notation || item;
            button.className = 'control-btn border border-gray-300 rounded py-1 text-xs text-gray-700 hover:bg-gray-100';
            button.innerHTML = formatNoteHTML(notation === '' ? 'Maj' : notation);
            button.dataset.value = item;
            button.dataset.key = 'chordType';
            button.dataset.type = 'single';
            combinedChordSelector.appendChild(button);
        });
    }

    function addEventListeners() {
        document.getElementById('controls-container').addEventListener('click', (e) => {
            const btn = e.target.closest('.control-btn');
            if (btn) {
                handleButtonClick(btn);
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
        notationToggle.addEventListener('change', (e) => {
            state.notationMode = e.target.checked ? 'flats' : 'sharps';
            createChordButtons();
            setupDiatonicPanel();
            updateControlsFromState();
            updateDisplay();
        });
        resetButton.addEventListener('click', resetAll);
        fretCountInput.addEventListener('change', (e) => {
            const newCount = parseInt(e.target.value, 10);
            if (isNaN(newCount) || newCount < 12 || newCount > 24) { e.target.value = FRET_COUNT; return; }
            FRET_COUNT = newCount;
            createFretboard();
            updateDisplay();
        });
        diatonicKeySelector.addEventListener('change', renderDiatonicChords);
        diatonicModeSelectorContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.diatonic-mode-btn');
            if(btn && btn.dataset.mode) {
                state.diatonicMode = btn.dataset.mode;
                renderDiatonicChords();
            }
        });
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
                } else {
                    selectedNotesForLookup = selectedNotesForLookup.filter(n => n.id !== noteId);
                }
            } else {
                if (existingNote) {
                    selectedNotesForLookup = selectedNotesForLookup.filter(n => n.id !== noteId);
                } else {
                    selectedNotesForLookup = selectedNotesForLookup.filter(n => n.string !== string);
                    selectedNotesForLookup.push({ id: noteId, string, fret, noteIndex, status: 'selected' });
                }
            }
            updateReverseLookupFretboard();
        } else {
            const displayNotes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;
            const newRootNote = displayNotes[noteIndex];
            state.rootNote = state.rootNote === newRootNote ? null : newRootNote;
            updateControlsFromState();
            updateDisplay();
        }
    }

    function handleButtonClick(button) {
        const { key, value } = button.dataset;
        if (!key) return;

        state[key] = state[key] === value ? null : value;

        updateControlsFromState();
        updateDisplay();
    }

    function resetAll() {
        state = { ...state, rootNote: null, chordType: null, bassNote: null, showMajorPenta: false, showMinorPenta: false, displayAsDegrees: false };
        if (isReverseLookupMode) {
            selectedNotesForLookup = [];
            updateReverseLookupFretboard();
            fullChordNameDisplay.innerHTML = "指板を選択";
            fullChordNameDisplay.classList.remove('text-lg', 'text-red-500');
            fullChordNameDisplay.classList.add('text-base', 'text-gray-500');
        } else {
            updateControlsFromState();
            updateDisplay();
        }
        triggerPianoUpdate();
    }

    function updateControlsFromState() {
        fullChordNameDisplay.innerHTML = generateChordName(state, true);
        fullChordNameDisplay.classList.add('text-lg', 'text-red-500');
        fullChordNameDisplay.classList.remove('text-base', 'text-gray-500');

        document.querySelectorAll('.control-btn').forEach(btn => {
            const { key, value } = btn.dataset;
            const shouldBeActive = state[key] === value;
            btn.classList.toggle('active-chord', shouldBeActive);
        });

        bassNoteSelector.value = state.bassNote || '';
        majorPentaToggle.checked = state.showMajorPenta;
        minorPentaToggle.checked = state.showMinorPenta;
        degreeDisplayToggle.checked = state.displayAsDegrees;
        notationToggle.checked = state.notationMode === 'flats';
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
        if (!isRootSelected) {
            triggerPianoUpdate();
            return;
        };

        const currentNotes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;
        let rootNoteIndex = currentNotes.indexOf(state.rootNote);
        if (rootNoteIndex === -1) {
            const fallbackNotes = state.notationMode === 'flats' ? NOTES : NOTES_FLAT;
            const fallbackIndex = fallbackNotes.indexOf(state.rootNote);
            if(fallbackIndex !== -1) {
                rootNoteIndex = fallbackIndex;
            } else {
                return;
            }
        }

        if (state.showMajorPenta) highlightScale(calculateScaleNotes(rootNoteIndex, 'majorPentatonic'), 'major-penta');
        if (state.showMinorPenta) highlightScale(calculateScaleNotes(rootNoteIndex, 'minorPentatonic'), 'minor-penta');

        const chordData = calculateChord(state.chordType);
        const chordNoteMap = {};
        if (chordData && chordData.intervals) {
            chordData.intervals.forEach((interval, i) => {
                const noteIndex = (rootNoteIndex + interval) % 12;
                chordNoteMap[noteIndex] = chordData.degrees[i];
            });
        }
        highlightChord(chordNoteMap, rootNoteIndex);

        if (state.bassNote) {
            let bassNoteIndex = currentNotes.indexOf(state.bassNote);
            if (bassNoteIndex === -1) {
                const fallbackNotes = state.notationMode === 'flats' ? NOTES : NOTES_FLAT;
                bassNoteIndex = fallbackNotes.indexOf(state.bassNote);
            }
            if (bassNoteIndex !== -1) highlightBassNote(bassNoteIndex);
        }
        triggerPianoUpdate();
    }

    function getDegreeName(noteIndex, rootIndex) { return DEGREE_NAMES[(noteIndex - rootIndex + 12) % 12]; }

    function clearAndResetBoard() {
        const displayNotes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;
        let rootNoteIndex = -1;
        if (state.rootNote) {
            rootNoteIndex = displayNotes.indexOf(state.rootNote);
            if (rootNoteIndex === -1) {
                const otherNotes = state.notationMode === 'flats' ? NOTES : NOTES_FLAT;
                rootNoteIndex = otherNotes.indexOf(state.rootNote);
            }
        }

        for (let s = 0; s < STRING_COUNT; s++) {
            for (let f = 0; f <= FRET_COUNT; f++) {
                if (!fretboardGrid[s] || !fretboardGrid[s][f]) continue;
                const cell = fretboardGrid[s][f];
                cell.element.classList.remove('reverse-lookup-selected', 'reverse-lookup-muted', 'disabled');
                const highlights = cell.element.querySelectorAll('.highlight-circle, .scale-highlight');
                highlights.forEach(h => h.remove());

                if (state.displayAsDegrees && rootNoteIndex !== -1) {
                    const degreeName = getDegreeName(cell.noteIndex, rootNoteIndex);
                    cell.noteDisplay.innerHTML = formatNoteHTML(degreeName);
                } else {
                    const noteName = displayNotes[cell.noteIndex];
                    cell.noteDisplay.innerHTML = formatNoteHTML(noteName);
                }
            }
        }
    }

    function calculateChord(type) {
        if (type && CHORD_INTERVALS[type]) {
            return CHORD_INTERVALS[type];
        }
        return { intervals: [0], degrees: ['R'], notation: '' };
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
         const TENSION_DEGREE_NAMES = ['♭7', '7', '9', '♯9', '11', '13', '6', '♭♭7'];
         const noteIndicesToHighlight = Object.keys(noteMap).map(n => parseInt(n));
         const displayNotes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;

         for (let s = 0; s < STRING_COUNT; s++) {
            for (let f = 0; f <= FRET_COUNT; f++) {
                if (!fretboardGrid[s] || !fretboardGrid[s][f]) continue;
                const cell = fretboardGrid[s][f];
                if (noteIndicesToHighlight.includes(cell.noteIndex)) {
                     cell.noteDisplay.innerHTML = '';
                     const highlight = document.createElement('div');
                     highlight.className = 'highlight-circle';

                     let displayText = '';
                     if (state.displayAsDegrees) {
                        displayText = noteMap[cell.noteIndex];
                     } else {
                        displayText = displayNotes[cell.noteIndex];
                     }

                     const degreeText = noteMap[cell.noteIndex];

                     if (cell.noteIndex === rootNoteIndex) {
                        highlight.classList.add('root');
                        if (state.displayAsDegrees) {
                            displayText = 'R';
                        }
                     } else if (TENSION_DEGREE_NAMES.some(t => degreeText && degreeText.includes(t))) {
                        highlight.classList.add('tension');
                     } else {
                        highlight.classList.add('degree');
                     }

                     highlight.innerHTML = formatNoteHTML(displayText);
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

    function generateChordName(currentState, useHTML) {
        if (!currentState.rootNote) return '--';
        let name = currentState.rootNote;

        if (currentState.chordType) {
            const notation = CHORD_INTERVALS[currentState.chordType]?.notation || '';
            name += notation;
        }

        if (currentState.bassNote && currentState.bassNote !== currentState.rootNote) {
            name += `/${currentState.bassNote}`;
        }

        return useHTML ? formatNoteHTML(name) : name;
    }
    
    // --- PIANO KEYBOARD FUNCTIONS ---
    function createPianoKeyboard() {
        pianoKeyboardContainer.innerHTML = '';
        const startMidi = 53; // F3
        const endMidi = 84;   // C6
        const noteIsBlackMap = { 1: true, 3: true, 6: true, 8: true, 10: true }; // C=0
        let whiteKeyCount = 0;
        for (let midi = startMidi; midi <= endMidi; midi++) {
            if (!noteIsBlackMap[midi % 12]) {
                whiteKeyCount++;
            }
        }
        const whiteKeyWidth = 100 / whiteKeyCount;
        const blackKeyWidth = whiteKeyWidth * 0.6;
        let whiteKeysPassed = 0;
        for (let midi = startMidi; midi <= endMidi; midi++) {
            const noteIndex = midi % 12;
            const isBlack = noteIsBlackMap[noteIndex];
            const keyElement = document.createElement('div');
            keyElement.dataset.midi = midi;
            if (isBlack) {
                keyElement.className = 'piano-key-black';
                keyElement.style.width = `${blackKeyWidth}%`;
                const leftOffset = (whiteKeysPassed * whiteKeyWidth) - (blackKeyWidth / 2);
                keyElement.style.left = `${leftOffset}%`;
                pianoKeyboardContainer.appendChild(keyElement);
            } else {
                keyElement.className = 'piano-key-white';
                keyElement.style.width = `${whiteKeyWidth}%`;
                pianoKeyboardContainer.appendChild(keyElement);
                whiteKeysPassed++;
            }
        }
    }
    
    function updatePianoHighlight() {
        document.querySelectorAll('.piano-key-white.highlighted, .piano-key-black.highlighted').forEach(key => {
            key.classList.remove('highlighted');
        });

        let sourceState = null;
        if (isReverseLookupMode && identifiedChordState) {
            sourceState = identifiedChordState;
        } else if (!isReverseLookupMode && state.rootNote) {
            sourceState = state;
        }
        if (!sourceState) return;

        const currentNotes = sourceState.notationMode === 'flats' ? NOTES_FLAT : NOTES;
        const rootNoteIndex = currentNotes.indexOf(sourceState.rootNote);
        if (rootNoteIndex === -1) return;

        const chordData = calculateChord(sourceState.chordType);
        if (!chordData || !chordData.intervals) return;

        const pianoMaxMidi = 84; // C6
        let baseMidi = 60 + rootNoteIndex; 
        
        const checkMidiNotes = chordData.intervals.map(interval => baseMidi + interval);
        if (Math.max(...checkMidiNotes) > pianoMaxMidi) {
            baseMidi -= 12;
        }

        const midiNotesToHighlight = new Set(
            chordData.intervals.map(interval => baseMidi + interval)
        );

        midiNotesToHighlight.forEach(midi => {
            const key = pianoKeyboardContainer.querySelector(`[data-midi="${midi}"]`);
            if (key) {
                key.classList.add('highlighted');
            }
        });
    }

    function triggerPianoUpdate() {
        setTimeout(updatePianoHighlight, 0);
    }

    // --- DIATONIC FUNCTIONS ---
    function setupDiatonicPanel() {
        const notes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;
        const currentKey = diatonicKeySelector.value;
        diatonicKeySelector.innerHTML = '';
        notes.forEach(note => {
            const option = document.createElement('option');
            option.value = note;
            option.textContent = note;
            diatonicKeySelector.appendChild(option);
        });
        diatonicKeySelector.value = currentKey;
        renderDiatonicChords();
    }

    function renderDiatonicChords() {
        diatonicModeSelectorContainer.querySelectorAll('.diatonic-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === state.diatonicMode);
        });

        diatonicChordsContainer.innerHTML = '';
        const key = diatonicKeySelector.value;
        const mode = state.diatonicMode;

        const currentNotes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;
        const keyIndex = currentNotes.indexOf(key);
        if (keyIndex === -1) return;

        const scaleIntervals = DIATONIC_INFO.intervals[mode];
        const chordTypes = DIATONIC_INFO.types_7th[mode];
        const degreeNames = DIATONIC_INFO.degrees[mode];
        const functions = DIATONIC_INFO.functions[mode];

        scaleIntervals.forEach((interval, i) => {
            const rootNoteIndex = (keyIndex + interval) % 12;
            const rootNoteName = currentNotes[rootNoteIndex];
            const chordType = chordTypes[i];
            
            const chordLabel = document.createElement('div');
            const chordFunction = functions[i];
            chordLabel.className = `diatonic-chord-label diatonic-label-${chordFunction}`;

            const degreeSpan = document.createElement('span');
            degreeSpan.className = 'diatonic-degree-roman';
            degreeSpan.innerHTML = formatNoteHTML(degreeNames[i]);
            chordLabel.appendChild(degreeSpan);

            const chordNameSpan = document.createElement('span');
            chordNameSpan.innerHTML = formatNoteHTML(`${rootNoteName}${CHORD_INTERVALS[chordType].notation}`);
            chordLabel.appendChild(chordNameSpan);
            
            diatonicChordsContainer.appendChild(chordLabel);
        });
    }

    // --- REVERSE LOOKUP FUNCTIONS ---
    function toggleReverseLookupMode() {
        isReverseLookupMode = !isReverseLookupMode;
        reverseLookupToggle.classList.toggle('active-lookup', isReverseLookupMode);

        resetAll();

        normalControls.classList.toggle('hidden', isReverseLookupMode);
        reverseLookupControls.classList.toggle('hidden', !isReverseLookupMode);

        if (isReverseLookupMode) {
            fullChordNameDisplay.innerHTML = "指板を選択";
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
        triggerPianoUpdate();
    }

    function identifyChordFromSelection() {
        const uniqueNoteIndexes = [...new Set(selectedNotesForLookup.filter(n => n.status === 'selected').map(n => n.noteIndex))];
        if (uniqueNoteIndexes.length < 2) {
            fullChordNameDisplay.innerHTML = "音を追加";
            fullChordNameDisplay.classList.remove('text-lg', 'text-red-500');
            fullChordNameDisplay.classList.add('text-sm', 'text-gray-500');
            identifiedChordState = null;
            return;
        }

        const result = findChord(uniqueNoteIndexes);
        if (result) {
            fullChordNameDisplay.innerHTML = formatNoteHTML(result.name);
            fullChordNameDisplay.classList.add('text-lg', 'text-red-500');
            fullChordNameDisplay.classList.remove('text-sm', 'text-gray-500');
            identifiedChordState = result.state;
        } else {
            fullChordNameDisplay.innerHTML = "不明なコード";
            fullChordNameDisplay.classList.remove('text-lg', 'text-red-500');
            fullChordNameDisplay.classList.add('text-sm', 'text-gray-500');
            identifiedChordState = null;
        }
    }

    function findChord(noteIndexes) {
        const CHORD_DEFINITIONS = [
            { key: 'M9', intervals: [0, 4, 7, 11, 14] },
            { key: '9', intervals: [0, 4, 7, 10, 14] },
            { key: 'm9', intervals: [0, 3, 7, 10, 14] },
            { key: '7s9', intervals: [0, 4, 7, 10, 15] },
            { key: '7b9', intervals: [0, 4, 7, 10, 13] },
            { key: 'dim7', intervals: [0, 3, 6, 9] },
            { key: 'm7b5', intervals: [0, 3, 6, 10] },
            { key: 'M7', intervals: [0, 4, 7, 11] },
            { key: '7', intervals: [0, 4, 7, 10] },
            { key: 'm7', intervals: [0, 3, 7, 10] },
            { key: 'm6', intervals: [0, 3, 7, 9] },
            { key: '6', intervals: [0, 4, 7, 9] },
            { key: 'aug', intervals: [0, 4, 8] },
            { key: 'dim', intervals: [0, 3, 6] },
            { key: 'min', intervals: [0, 3, 7] },
            { key: 'Maj', intervals: [0, 4, 7] },
            { key: 'sus2', intervals: [0, 2, 7] },
            { key: 'sus4', intervals: [0, 5, 7] },
        ];

        const displayNotes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;

        for (const root of noteIndexes) {
            const intervals = noteIndexes.map(note => (note - root + 12) % 12).sort((a, b) => a - b);

            for (const chordDef of CHORD_DEFINITIONS) {
                const comparisonIntervals = [...new Set(chordDef.intervals.map(i => i % 12))].sort((a, b) => a - b);

                if (intervals.length === comparisonIntervals.length && intervals.every((v, i) => v === comparisonIntervals[i])) {
                    const rootNoteName = displayNotes[root];
                    const chordInfo = CHORD_INTERVALS[chordDef.key];
                    return {
                        name: `${rootNoteName}${chordInfo.notation}`,
                        state: {
                            rootNote: rootNoteName,
                            chordType: chordDef.key,
                            notationMode: state.notationMode
                        }
                    };
                }
            }
        }
        return null;
    }

    // --- START THE APP ---
    initialize();
});