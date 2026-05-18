const { useState, useEffect } = React;

// Simplified icon components (since lucide-react won't work in browser without bundler)
const RotateCcw = () => <span>🔄</span>;
const Trophy = () => <span>🏆</span>;
const AlertCircle = () => <span>⚠️</span>;

const TechRecruitmentBingo = () => {
  const bingoSquares = [
    // Row 1 - The Classics
    [
      '"We went with a more experienced candidate"',
      'Noreply rejection email',
      '"Great profile, but…"',
      'Position put on hold for 3 months',
      'Ghosted after interview'
    ],
    // Row 2 - Junior-Specific Pain
    [
      '"1–2 years experience required" (junior role)',
      'Rejected for lack of "production experience"',
      'Asked to rate yourself 1–10',
      '"We don\'t expect you to know everything" → proceeds to expect everything',
      'Internship requires prior internships'
    ],
    // Row 3 - Logistics Chaos (with FREE SPACE in center)
    [
      'Role suddenly relocated to another city',
      'Hybrid → actually on-site',
      'FREE SPACE',
      'Recruiter can\'t call your number',
      '"Are you legally allowed to work here?" (asked 3 times)'
    ],
    // Row 4 - Process Nonsense
    [
      '5-step process for junior role',
      'Take-home assignment > 6 hours',
      '"Quick technical test" (full system design)',
      'Feedback = "It\'s not you, it\'s us"',
      'Different interviewer asks same questions again'
    ],
    // Row 5 - Corporate Poetry
    [
      'E-mail personally addressed to another candidate',
      '"We want to invite you to the final interview - wait actually we are filling the position internally"',
      'Applying at 22:00, rejected at 22:49: "After careful consideration..."',
      '"We\'re like a family" but the family is dysfunctional',
      '"Competitive salary" (it is not, but hey free coffee and snacks)'
    ]
  ];

  const bonusSquares = [
    'Rejection because "team priorities changed"',
    'Job reposted after rejection',
    '"Want to apply? Fill out this 10-page form on a broken legacy PHP third-party platform"',
    'Interviewer didn\'t read your CV',
    '"Let\'s stay in touch" (never stays in touch)',
    '"We are a human-centred company" but you never spoke to a human in the whole process',
  ];

  // Initialize with center square (FREE SPACE) already checked
  const [checkedSquares, setCheckedSquares] = useState(() => {
    const initial = Array(5).fill(null).map(() => Array(5).fill(false));
    initial[2][2] = true; // Center FREE SPACE
    return initial;
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [checkedBonus, setCheckedBonus] = useState(Array(5).fill(false));
  const [hasBingo, setHasBingo] = useState(false);
  const [bingoPattern, setBingoPattern] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Check for BINGO
  useEffect(() => {
    const checkBingo = () => {
      // Check rows
      for (let i = 0; i < 5; i++) {
        if (checkedSquares[i].every(sq => sq)) {
          setHasBingo(true);
          setBingoPattern(`Row ${i + 1} complete`);
          setShowConfetti(true);
          return;
        }
      }

      // Check columns
      for (let j = 0; j < 5; j++) {
        if (checkedSquares.every(row => row[j])) {
          setHasBingo(true);
          setBingoPattern(`Column ${j + 1} complete`);
          setShowConfetti(true);
          return;
        }
      }

      // Check diagonals
      if (checkedSquares.every((row, i) => row[i])) {
        setHasBingo(true);
        setBingoPattern('Diagonal \\ complete');
        setShowConfetti(true);
        return;
      }

      if (checkedSquares.every((row, i) => row[4 - i])) {
        setHasBingo(true);
        setBingoPattern('Diagonal / complete');
        setShowConfetti(true);
        return;
      }

      setHasBingo(false);
      setBingoPattern('');
      setShowConfetti(false);
    };

    checkBingo();
  }, [checkedSquares]);

  const toggleSquare = (row, col) => {
    // Don't allow unchecking FREE SPACE
    if (row === 2 && col === 2) return;

    const newChecked = checkedSquares.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? !c : c))
    );
    setCheckedSquares(newChecked);
  };

  const toggleBonus = (index) => {
    const newBonus = [...checkedBonus];
    newBonus[index] = !newBonus[index];
    setCheckedBonus(newBonus);
  };

  const resetGame = () => {
    const initial = Array(5).fill(null).map(() => Array(5).fill(false));
    initial[2][2] = true; // Keep FREE SPACE checked
    setCheckedSquares(initial);
    setCheckedBonus(Array(5).fill(false));
    setHasBingo(false);
    setBingoPattern('');
    setShowConfetti(false);
  };

  const totalChecked = checkedSquares.flat().filter(Boolean).length - 1; // -1 for FREE SPACE
  const totalBonus = checkedBonus.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 relative overflow-hidden flex items-center justify-center">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center max-w-6xl mx-auto relative z-10 flex-col">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-4 px-6 py-2 bg-red-500/20 border-2 border-red-500 rounded-full">
            <span className="text-red-400 font-bold text-sm tracking-wider uppercase">Junior Dev Survival</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: 'Impact, Arial Black, sans-serif', textShadow: '3px 3px 0 rgba(239, 68, 68, 0.5)' }}>
            TECH RECRUITMENT BINGO 2026
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 font-medium italic">
            Because suffering alone is no fun
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2">
            <span className="text-slate-400 text-sm">Checked squares: </span>
            <span className="text-white font-bold">{totalChecked}/24</span>
          </div>
          {showAdvanced && (
            <div className="bg-orange-900/30 backdrop-blur-sm border border-orange-700 rounded-lg px-4 py-2">
              <span className="text-orange-400 text-sm">Bonus: </span>
              <span className="text-white font-bold">{totalBonus}/5</span>
            </div>
          )}
          <button
            onClick={resetGame}
            className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-lg px-4 py-2 text-white flex items-center gap-2 transition-all hover:scale-105"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {/* BINGO Alert */}
        {hasBingo && (
          <div className="mb-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-1 rounded-lg animate-pulse">
            <div className="bg-slate-900 rounded-md p-4 flex items-center gap-3">
              <Trophy className="text-yellow-400" size={32} />
              <div>
                <p className="text-2xl font-bold text-white">🎉 BINGO! 🎉</p>
                <p className="text-yellow-200">
                  {bingoPattern} — Congratulations, you have officially experienced{' '}
                  <a 
                    href="https://www.youtube.com/watch?v=WYp64dRHW2o" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-100 transition-colors"
                  >
                    recruiting hell
                  </a>
                  {' '}as a Junior!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Bingo Grid */}
        <div className="bg-slate-800/30 backdrop-blur-md border-4 border-purple-500 rounded-2xl p-4 md:p-6 mb-8 shadow-2xl">
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {bingoSquares.map((row, rowIndex) =>
              row.map((square, colIndex) => {
                const isChecked = checkedSquares[rowIndex][colIndex];
                const isFreeSpace = rowIndex === 2 && colIndex === 2;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => toggleSquare(rowIndex, colIndex)}
                    className={`
                      aspect-square p-2 md:p-3 rounded-lg text-xs md:text-sm font-semibold
                      transition-all duration-300 transform hover:scale-105
                      border-2 flex items-center justify-center text-center
                      ${isFreeSpace
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 text-white cursor-default shadow-lg shadow-green-500/50'
                        : isChecked
                          ? 'bg-gradient-to-br from-red-500 to-pink-600 border-red-400 text-white shadow-lg shadow-red-500/50'
                          : 'bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500'
                      }
                    `}
                    disabled={isFreeSpace}
                  >
                    {isFreeSpace ? (
                      <div className="text-center">
                        <div className="text-lg font-black mb-1">★</div>
                        <div className="text-xs leading-tight">"Culture fit"</div>
                        <div className="text-xs opacity-80">(undefined, unfalsifiable)</div>
                      </div>
                    ) : (
                      <span className="leading-tight">{square}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Advanced Mode Toggle */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg"
          >
            {showAdvanced ? '🔥 Hide' : '🧨 Activate'} Advanced Mode (Bonus Squares)
          </button>
        </div>

        {/* Bonus Squares */}
        {showAdvanced && (
          <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-md border-4 border-orange-500 rounded-2xl p-4 md:p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-orange-400" size={24} />
              <h2 className="text-2xl font-black text-orange-300" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                BONUS SQUARES — Advanced Mode
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {bonusSquares.map((square, index) => (
                <button
                  key={index}
                  onClick={() => toggleBonus(index)}
                  className={`
                    p-4 rounded-lg text-sm font-semibold transition-all transform hover:scale-105
                    border-2 text-left
                    ${checkedBonus[index]
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-400 text-white shadow-lg shadow-orange-500/50'
                      : 'bg-orange-900/30 border-orange-700 text-orange-200 hover:bg-orange-800/40 hover:border-orange-600'
                    }
                  `}
                >
                  {square}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center items-center">
          <p className="text-slate-400 text-sm italic">
            "We will contact you" - spoiler: <span className="text-slate-300 font-semibold">They never did</span>
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Created with rage and despair in 2026 🔥 Entirely vibe-coded, like most recruiting processes anyway
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          from {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
};

// Make component available globally (no export needed for browser)
window.TechRecruitmentBingo = TechRecruitmentBingo;