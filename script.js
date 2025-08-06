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
    
    const DIATONIC_CHORDS_MAJOR_TABLE = {
        'C':  ['CM7', 'Dm7', 'Em7', 'FM7', 'G7', 'Am7', 'Bm7(b5)'],
        'C♯': ['C♯M7', 'D♯m7', 'E♯m7', 'F♯M7', 'G♯7', 'A♯m7', 'B♯m7(b5)'],
        'D♭': ['D♭M7', 'E♭m7', 'Fm7', 'G♭M7', 'A♭7', 'B♭m7', 'Cm7(b5)'],
        'D':  ['DM7', 'Em7', 'F♯m7', 'GM7', 'A7', 'Bm7', 'C♯m7(b5)'],
        'E♭': ['E♭M7', 'Fm7', 'Gm7', 'A♭M7', 'B♭7', 'Cm7', 'Dm7(b5)'],
        'E':  ['EM7', 'F♯m7', 'G♯m7', 'AM7', 'B7', 'C♯m7', 'D♯m7(b5)'],
        'F':  ['FM7', 'Gm7', 'Am7', 'B♭M7', 'C7', 'Dm7', 'Em7(b5)'],
        'F♯': ['F♯M7', 'G♯m7', 'A♯m7', 'BM7', 'C♯7', 'D♯m7', 'E♯m7(b5)'],
        'G♭': ['G♭M7', 'A♭m7', 'B♭m7', 'C♭M7', 'D♭7', 'E♭m7', 'Fm7(b5)'],
        'G':  ['GM7', 'Am7', 'Bm7', 'CM7', 'D7', 'Em7', 'F♯m7(b5)'],
        'A♭': ['A♭M7', 'B♭m7', 'Cm7', 'D♭M7', 'E♭7', 'Fm7', 'Gm7(b5)'],
        'A':  ['AM7', 'Bm7', 'C♯m7', 'DM7', 'E7', 'F♯m7', 'G♯m7(b5)'],
        'B♭': ['B♭M7', 'Cm7', 'Dm7', 'E♭M7', 'F7', 'Gm7', 'Am7(b5)'],
        'B':  ['BM7', 'C♯m7', 'D♯m7', 'EM7', 'F♯7', 'G♯m7', 'A♯m7(b5)'],
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
            major: ['I', 'IIm', 'IIIm', 'IV', 'V', 'VIm', 'VIIm(♭5)'],
            minor: ['Im', 'IIm(♭5)', '♭III', 'IVm', 'Vm', '♭VI', '♭VII']
        },
        functions: {
            major: ['tonic', 'subdominant', 'tonic', 'subdominant', 'dominant', 'tonic', 'dominant'],
            minor: ['tonic', 'subdominant', 'tonic', 'subdominant', 'dominant', 'subdominant', 'dominant']
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
    const pianoKeyboardContainer = document.getElementById('piano-keyboard-container');
    const chordSelectorContainer = document.getElementById('chord-selector-container');
    const normalModeToggles = document.getElementById('normal-mode-toggles');
    const normalModeSelectors = document.getElementById('normal-mode-selectors');
    const degreeToggleWrapper = document.getElementById('degree-toggle-wrapper');
    const reverseDegreeToggleWrapper = document.getElementById('reverse-degree-toggle-wrapper');
    const reverseDegreeToggle = document.getElementById('reverse-degree-toggle');
    const reverseDegreeToggleLabel = document.getElementById('reverse-degree-toggle-label');

    let fretboardGrid = [];

    // --- STATE MANAGEMENT ---
    let state = {
        rootNote: null, chordType: null, bassNote: null,
        showMajorPenta: false, showMinorPenta: false, displayAsDegrees: false,
        notationMode: 'flats',
        diatonicMode: 'major',
        mutedStrings: Array(STRING_COUNT).fill(false),
        isAllKeysViewActive: false
    };
    let isReverseLookupMode = false;
    let selectedNotesForLookup = [];
    let identifiedChordState = null;
    let lastClickInfo = { fret: -1, string: -1, time: 0 };
    let reverseLookupRoot = null; 
    let reverseShowAsNotes = true; 

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
        return name.replace(/([♯♭]|\(b5\)|\(♯9\)|\(♭9\)|b5)/g, '<span class="accidental">$1</span>');
    }
    
    function createFretboard() {
        fretboardContainer.innerHTML = '';
        fretboardGrid = [];
        const scrollWrapper = document.createElement('div');
        scrollWrapper.className = 'fretboard-scroll-wrapper overflow-x-auto pb-2';
        const board = document.createElement('div');
        board.className = 'grid gap-y-1 min-w-[750px]';
        board.style.gridTemplateRows = `repeat(${STRING_COUNT}, 24px)`;

        for (let s = 0; s < STRING_COUNT; s++) {
            const stringRow = document.createElement('div');
            stringRow.className = 'string-row grid relative';
            stringRow.style.gridTemplateColumns = `30px repeat(${FRET_COUNT + 1}, 1fr)`;
            fretboardGrid[s] = [];

            const muteBtnCell = document.createElement('div');
            muteBtnCell.className = 'flex items-center justify-center';
            const muteBtn = document.createElement('button');
            muteBtn.className = 'mute-btn';
            muteBtn.textContent = '×';
            muteBtn.addEventListener('click', () => toggleMuteString(s));
            muteBtnCell.appendChild(muteBtn);
            stringRow.appendChild(muteBtnCell);

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

            fretboardGrid[s].rowElement = stringRow;
            fretboardGrid[s].muteButton = muteBtn;

            const stringLine = document.createElement('div');
            stringLine.className = 'string absolute top-1/2 -translate-y-1/2';
            stringLine.style.height = `${s * 0.4 + 1}px`;
            const fretWidthPercentage = 100 / (FRET_COUNT + 2);
            stringLine.style.left = `calc(30px + ${fretWidthPercentage / 2}%)`; 
            stringLine.style.width = `calc(100% - 30px - ${fretWidthPercentage}%)`;
            stringRow.appendChild(stringLine);
            board.appendChild(stringRow);
        }
        scrollWrapper.appendChild(board);

        const fretNumberRow = document.createElement('div');
        fretNumberRow.className = 'grid mt-2 min-w-[750px]';
        fretNumberRow.style.gridTemplateColumns = `30px repeat(${FRET_COUNT + 1}, 1fr)`;
        fretNumberRow.appendChild(document.createElement('div'));

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
            state.notationMode = e.target.checked ? 'sharps' : 'flats';
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
        diatonicKeySelector.addEventListener('change', () => {
            if (!state.isAllKeysViewActive) {
                renderDiatonicChords();
            }
        });
        
        diatonicModeSelectorContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.diatonic-mode-btn');
            if(btn && btn.dataset.mode) {
                const newMode = btn.dataset.mode;
                if (state.diatonicMode === newMode) {
                    state.isAllKeysViewActive = !state.isAllKeysViewActive;
                } else {
                    state.diatonicMode = newMode;
                    state.isAllKeysViewActive = false;
                }
                renderDiatonicChords();
            }
        });

        reverseLookupToggle.addEventListener('click', toggleReverseLookupMode);
        reverseDegreeToggle.addEventListener('change', (e) => {
            if (reverseLookupRoot) {
                reverseShowAsNotes = e.target.checked;
                updateReverseLookupFretboard();
            }
        });
    }

    function handleFretClick(fret, string) {
        if (state.mutedStrings[string]) {
            state.mutedStrings[string] = false;
        }

        const clickedCell = fretboardGrid[string][fret];
        if (clickedCell.element.classList.contains('disabled')) return;
    
        if (isReverseLookupMode) {
            const now = new Date().getTime();
            const isDoubleClick = (fret === lastClickInfo.fret && string === lastClickInfo.string && (now - lastClickInfo.time) < 300);
            lastClickInfo = { fret, string, time: now };
    
            if (isDoubleClick) {
                reverseLookupRoot = {
                    noteIndex: clickedCell.noteIndex,
                    fret: fret,
                    string: string,
                };
                reverseShowAsNotes = false; 
                updateReverseLookupFretboard();
                return; 
            }
    
            if (reverseLookupRoot && reverseLookupRoot.fret === fret && reverseLookupRoot.string === string) {
                reverseLookupRoot = null;
                updateReverseLookupFretboard();
                return;
            }
    
            const noteId = `${string}-${fret}`;
            const existingNoteIndex = selectedNotesForLookup.findIndex(n => n.id === noteId);
    
            if (existingNoteIndex > -1) {
                selectedNotesForLookup.splice(existingNoteIndex, 1);
            } else {
                selectedNotesForLookup = selectedNotesForLookup.filter(n => n.string !== string);
                selectedNotesForLookup.push({ id: noteId, string, fret, noteIndex: clickedCell.noteIndex, status: 'selected' });
            }
            updateReverseLookupFretboard();
    
        } else {
            const displayNotes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;
            const newRootNote = displayNotes[clickedCell.noteIndex];
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
        const currentNotationMode = state.notationMode;
        
        state = { 
            rootNote: null, chordType: null, bassNote: null,
            showMajorPenta: false, showMinorPenta: false, displayAsDegrees: false,
            notationMode: currentNotationMode, 
            diatonicMode: 'major',
            mutedStrings: Array(STRING_COUNT).fill(false),
            isAllKeysViewActive: false
        };

        selectedNotesForLookup = [];
        identifiedChordState = null;
        reverseLookupRoot = null;
        reverseShowAsNotes = true;

        if (isReverseLookupMode) {
            updateReverseLookupFretboard();
        } else {
            updateControlsFromState();
            updateDisplay();
        }
        setupDiatonicPanel();
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
        notationToggle.checked = state.notationMode === 'sharps';
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
            rootNoteIndex = fallbackNotes.indexOf(state.rootNote);
            if (rootNoteIndex === -1) return;
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
        
        let rootNoteForDisplay = null;
        let shouldDisplayDegrees = false;

        if (isReverseLookupMode) {
            if (reverseLookupRoot && !reverseShowAsNotes) {
                rootNoteForDisplay = reverseLookupRoot.noteIndex;
                shouldDisplayDegrees = true;
            }
        } else if (state.rootNote && state.displayAsDegrees) {
            rootNoteForDisplay = displayNotes.indexOf(state.rootNote);
            if (rootNoteForDisplay === -1) { 
                const otherNotes = state.notationMode === 'flats' ? NOTES : NOTES_FLAT;
                rootNoteForDisplay = otherNotes.indexOf(state.rootNote);
            }
            shouldDisplayDegrees = rootNoteForDisplay !== -1;
        }

        for (let s = 0; s < STRING_COUNT; s++) {
            if (fretboardGrid[s] && fretboardGrid[s].rowElement) {
                const isMuted = state.mutedStrings[s];
                fretboardGrid[s].rowElement.classList.toggle('muted', isMuted);
                fretboardGrid[s].muteButton.classList.toggle('active', isMuted);
            }

            for (let f = 0; f <= FRET_COUNT; f++) {
                if (!fretboardGrid[s] || !fretboardGrid[s][f]) continue;
                const cell = fretboardGrid[s][f];
                cell.element.classList.remove('reverse-lookup-selected', 'reverse-lookup-muted', 'disabled');
                const highlights = cell.element.querySelectorAll('.highlight-circle, .scale-highlight, .root-outline');
                highlights.forEach(h => h.remove());
                cell.noteDisplay.innerHTML = ''; 

                if (shouldDisplayDegrees) {
                    const degreeName = getDegreeName(cell.noteIndex, rootNoteForDisplay);
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
            if(state.mutedStrings[s]) continue;
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
            if(state.mutedStrings[s]) continue;
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
            if(state.mutedStrings[s]) continue;
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
    
    function createPianoKeyboard() {
        pianoKeyboardContainer.innerHTML = '';
        const startMidi = 53;
        const endMidi = 84;
        const noteIsBlackMap = { 1: true, 3: true, 6: true, 8: true, 10: true };
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

        const pianoMaxMidi = 84;
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
        let currentKey = diatonicKeySelector.value;
        
        if (!notes.includes(currentKey)) {
             const sharpIndex = NOTES.indexOf(currentKey);
             const flatIndex = NOTES_FLAT.indexOf(currentKey);
             if (sharpIndex !== -1 && NOTES_FLAT[sharpIndex]) currentKey = NOTES_FLAT[sharpIndex];
             else if (flatIndex !== -1 && NOTES[flatIndex]) currentKey = NOTES[flatIndex];
             else currentKey = notes[0];
        }

        diatonicKeySelector.innerHTML = '';
        notes.forEach(note => {
            const option = document.createElement('option');
            option.value = note;
            option.textContent = note;
            diatonicKeySelector.appendChild(option);
        });
        
        if ([...diatonicKeySelector.options].some(opt => opt.value === currentKey)) {
            diatonicKeySelector.value = currentKey;
        } else if (diatonicKeySelector.options.length > 0) {
            diatonicKeySelector.selectedIndex = 0;
        }

        renderDiatonicChords();
    }
    
    function renderDiatonicChords() {
        diatonicModeSelectorContainer.querySelectorAll('.diatonic-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === state.diatonicMode);
        });
        diatonicKeySelector.disabled = state.isAllKeysViewActive;

        diatonicChordsContainer.innerHTML = '';

        if (state.isAllKeysViewActive) {
            renderAllKeysView();
        } else {
            renderSingleKeyView();
        }
    }

    function renderSingleKeyView() {
        diatonicChordsContainer.className = 'flex flex-wrap gap-1'; 
        const key = diatonicKeySelector.value;
        const mode = state.diatonicMode;

        if (mode === 'major') {
            const chords = DIATONIC_CHORDS_MAJOR_TABLE[key];
            if (!chords) return;
            const degreeNames = DIATONIC_INFO.degrees.major;
            const functions = DIATONIC_INFO.functions.major;
            chords.forEach((chordName, i) => {
                diatonicChordsContainer.appendChild(
                    createDiatonicChordLabel(chordName, degreeNames[i], functions[i])
                );
            });
        } else { // minor
            const currentNotes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;
            const keyIndex = currentNotes.indexOf(key);
            if (keyIndex === -1) return;
            const scaleIntervals = DIATONIC_INFO.intervals.minor;
            const chordTypes = DIATONIC_INFO.types_7th.minor;
            const degreeNames = DIATONIC_INFO.degrees.minor;
            const functions = DIATONIC_INFO.functions.minor;
            scaleIntervals.forEach((interval, i) => {
                const rootNoteIndex = (keyIndex + interval) % 12;
                const rootNoteName = currentNotes[rootNoteIndex];
                const chordType = chordTypes[i];
                const chordName = `${rootNoteName}${CHORD_INTERVALS[chordType].notation}`;
                diatonicChordsContainer.appendChild(
                    createDiatonicChordLabel(chordName, degreeNames[i], functions[i])
                );
            });
        }
    }

    function renderAllKeysView() {
        diatonicChordsContainer.className = 'diatonic-all-view-grid';
        const mode = state.diatonicMode;
        const currentNotes = state.notationMode === 'flats' ? NOTES_FLAT : NOTES;
        const allKeysInOrder = state.notationMode === 'flats' 
            ? ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'] 
            : ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

        diatonicChordsContainer.appendChild(document.createElement('div'));
        const degreeNames = DIATONIC_INFO.degrees[mode];
        degreeNames.forEach(degree => {
            const headerCell = document.createElement('div');
            headerCell.className = 'diatonic-header-cell';
            headerCell.innerHTML = formatNoteHTML(degree);
            diatonicChordsContainer.appendChild(headerCell);
        });

        allKeysInOrder.forEach(key => {
            const keyCell = document.createElement('div');
            keyCell.className = 'diatonic-key-name-cell';
            keyCell.innerHTML = formatNoteHTML(key);
            diatonicChordsContainer.appendChild(keyCell);

            const functions = DIATONIC_INFO.functions[mode];
            if (mode === 'major') {
                const chords = DIATONIC_CHORDS_MAJOR_TABLE[key];
                if (!chords) return;
                chords.forEach((chordName, i) => {
                    diatonicChordsContainer.appendChild(
                        createDiatonicChordLabel(chordName, null, functions[i])
                    );
                });
            } else { // minor
                const keyIndex = currentNotes.indexOf(key);
                if (keyIndex === -1) return;
                const scaleIntervals = DIATONIC_INFO.intervals.minor;
                const chordTypes = DIATONIC_INFO.types_7th.minor;
                scaleIntervals.forEach((interval, i) => {
                    const rootNoteIndex = (keyIndex + interval) % 12;
                    const rootNoteName = currentNotes[rootNoteIndex];
                    const chordType = chordTypes[i];
                    const chordName = `${rootNoteName}${CHORD_INTERVALS[chordType].notation}`;
                    diatonicChordsContainer.appendChild(
                        createDiatonicChordLabel(chordName, null, functions[i])
                    );
                });
            }
        });
    }

    function createDiatonicChordLabel(chordName, degreeName, chordFunction) {
        const chordLabel = document.createElement('div');
        chordLabel.className = `diatonic-chord-label diatonic-label-${chordFunction}`;
        
        if (degreeName) {
            const degreeSpan = document.createElement('span');
            degreeSpan.className = 'diatonic-degree-roman';
            degreeSpan.innerHTML = formatNoteHTML(degreeName.replace('(b5)','(♭5)'));
            chordLabel.appendChild(degreeSpan);
        } else {
            chordLabel.style.justifyContent = 'center';
            chordLabel.style.fontSize = '0.75rem';
        }

        const chordNameSpan = document.createElement('span');
        
        // [変更] (b5)や(♭5)の前に改行可能なゼロ幅スペースを挿入し、はみ出しを防ぐ
        const finalChordName = chordName.replace(/(\(b5\)|\(♭5\))/g, '\u200B$1');

        chordNameSpan.innerHTML = formatNoteHTML(finalChordName);
        chordLabel.appendChild(chordNameSpan);
        
        return chordLabel;
    }

    // --- REVERSE LOOKUP FUNCTIONS ---
    function toggleReverseLookupMode() {
        isReverseLookupMode = !isReverseLookupMode;
        reverseLookupToggle.classList.toggle('active-lookup', isReverseLookupMode);

        chordSelectorContainer.classList.toggle('hidden', isReverseLookupMode);
        normalModeToggles.classList.toggle('hidden', isReverseLookupMode);
        normalModeSelectors.classList.toggle('hidden', isReverseLookupMode);
        
        degreeToggleWrapper.classList.toggle('hidden', isReverseLookupMode);
        reverseDegreeToggleWrapper.classList.toggle('hidden', !isReverseLookupMode);
        
        resetAll(); 
    }
    
    function toggleMuteString(stringIndex) {
        state.mutedStrings[stringIndex] = !state.mutedStrings[stringIndex];
        if (state.mutedStrings[stringIndex] && isReverseLookupMode) {
            selectedNotesForLookup = selectedNotesForLookup.filter(note => note.string !== stringIndex);
        }
        if (isReverseLookupMode) {
            updateReverseLookupFretboard();
        } else {
            updateDisplay();
        }
    }

    function updateReverseLookupFretboard() {
        clearAndResetBoard();
        
        selectedNotesForLookup.forEach(note => {
            if (state.mutedStrings[note.string]) return;
            const cell = fretboardGrid[note.string][note.fret];
            cell.element.classList.add('reverse-lookup-selected');
        });

        if (reverseLookupRoot) {
            for (let s = 0; s < STRING_COUNT; s++) {
                if (state.mutedStrings[s]) continue;
                for (let f = 0; f <= FRET_COUNT; f++) {
                    const cell = fretboardGrid[s][f];
                    if (cell.noteIndex === reverseLookupRoot.noteIndex) {
                        const isDesignatedRoot = (s === reverseLookupRoot.string && f === reverseLookupRoot.fret);
                        const displayEl = cell.noteDisplay;
                        const originalText = displayEl.innerHTML;
                        displayEl.innerHTML = ''; 

                        if (isDesignatedRoot) {
                            const highlight = document.createElement('div');
                            highlight.className = 'highlight-circle root';
                            highlight.innerHTML = originalText;
                            displayEl.appendChild(highlight);
                        } else {
                            const outline = document.createElement('div');
                            outline.className = 'root-outline';
                            outline.innerHTML = originalText;
                            displayEl.appendChild(outline);
                        }
                    }
                }
            }
        }
    
        reverseDegreeToggle.disabled = !reverseLookupRoot;
        reverseDegreeToggleLabel.classList.toggle('toggle-label-disabled', !reverseLookupRoot);
        reverseDegreeToggle.checked = reverseShowAsNotes;

        identifyChordFromSelection();
        triggerPianoUpdate();
    }
    
    function identifyChordFromSelection() {
        const uniqueNoteIndexes = [...new Set(selectedNotesForLookup.map(n => n.noteIndex))];
        if (uniqueNoteIndexes.length < 2) {
            fullChordNameDisplay.innerHTML = isReverseLookupMode ? "音を選択" : "--";
            if(isReverseLookupMode){
                fullChordNameDisplay.classList.remove('text-lg', 'text-red-500');
                fullChordNameDisplay.classList.add('text-base', 'text-gray-500');
            }
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

        const rootsToTest = reverseLookupRoot 
            ? [reverseLookupRoot.noteIndex]
            : noteIndexes;

        for (const root of rootsToTest) {
            const intervals = noteIndexes.map(note => (note - root + 12) % 12).sort((a, b) => a - b);
            const uniqueIntervals = [...new Set(intervals)];

            for (const chordDef of CHORD_DEFINITIONS) {
                const comparisonIntervals = [...new Set(chordDef.intervals.map(i => i % 12))].sort((a, b) => a - b);
                
                if (uniqueIntervals.length === comparisonIntervals.length && uniqueIntervals.every((v, i) => v === comparisonIntervals[i])) {
                    const rootNoteName = displayNotes[root];
                    const chordInfo = CHORD_INTERVALS[chordDef.key];
                    return {
                        name: `${rootNoteName}${chordInfo.notation}`,
                        state: { rootNote: rootNoteName, chordType: chordDef.key, notationMode: state.notationMode }
                    };
                }
            }
        }
        
        if(reverseLookupRoot){
             const otherRoots = noteIndexes.filter(n => n !== reverseLookupRoot.noteIndex);
             for (const root of otherRoots) {
                 const intervals = noteIndexes.map(note => (note - root + 12) % 12).sort((a, b) => a - b);
                 const uniqueIntervals = [...new Set(intervals)];
                 for (const chordDef of CHORD_DEFINITIONS) {
                     const comparisonIntervals = [...new Set(chordDef.intervals.map(i => i % 12))].sort((a, b) => a - b);
                     if (uniqueIntervals.length === comparisonIntervals.length && uniqueIntervals.every((v, i) => v === comparisonIntervals[i])) {
                         const rootNoteName = displayNotes[root];
                         const chordInfo = CHORD_INTERVALS[chordDef.key];
                         const specifiedRootName = displayNotes[reverseLookupRoot.noteIndex];
                         return { 
                             name: `${rootNoteName}${chordInfo.notation}/${specifiedRootName}`,
                             state: { rootNote: rootNoteName, chordType: chordDef.key, notationMode: state.notationMode }
                         };
                     }
                 }
             }
        }

        return null;
    }

    // --- START THE APP ---
    initialize();
});