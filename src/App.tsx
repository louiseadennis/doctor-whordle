import './App.css'

import { ClockIcon } from '@heroicons/react/outline'
import { format } from 'date-fns'
import { default as GraphemeSplitter } from 'grapheme-splitter'
import { useEffect, useState } from 'react'
import Div100vh from 'react-div-100vh'

import { AlertContainer } from './components/alerts/AlertContainer'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { DatePickerModal } from './components/modals/DatePickerModal'
import { InfoModal } from './components/modals/InfoModal'
import { MigrateStatsModal } from './components/modals/MigrateStatsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { StatsModal } from './components/modals/StatsModal'
import { UpdateModal } from './components/modals/UpdateModal'
import { Navbar } from './components/navbar/Navbar'
import {
  ALERT_TIME_MS,
  CHALLENGES,
  CHALLENGESR,
  DATE_LOCALE,
  DISCOURAGE_INAPP_BROWSERS,
  REVEAL_TIME_MS,
  WELCOME_INFO_MODAL_MS,
  WORDLENGTH,
  WORDLENGTHR,
} from './constants/settings'
import {
  CORRECT_WORD_MESSAGE,
  DISCOURAGE_INAPP_BROWSER_TEXT,
  GAME_COPIED_MESSAGE,
  HARD_MODE_ALERT_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  SHARE_FAILURE_TEXT,
  SWITCH_RANDOM_MESSAGE,
  SWITCH_WOTD_MESSAGE, // WIN_MESSAGES,
  WORD_NOT_FOUND_MESSAGE,
} from './constants/strings'
import { useAlert } from './context/AlertContext'
import { isInAppBrowser } from './lib/browser'
import {
  getStoredIsHighContrastMode,
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  setStoredIsHighContrastMode,
} from './lib/localStorage'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  explanation,
  explanationR,
  findFirstUnusedReveal,
  getGameDate,
  getIsLatestGame,
  getRandomExplanation,
  getRandomWord,
  getRandomWordIndex,
  isWinningWord,
  isWordInWordList,
  isWordInWordListR,
  setGameDate,
  solution,
  solutionGameDate,
  solutionR,
  unicodeLength,
} from './lib/words'

function App() {
  const isLatestGame = getIsLatestGame()
  const gameDate = getGameDate()
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches

  const { showError: showErrorAlert, showSuccess: showSuccessAlert } =
    useAlert()
  const [wordLength, setWordLength] = useState(WORDLENGTH)
  const [challenges, setChallenges] = useState(CHALLENGES)
  const [currentGuess, setCurrentGuess] = useState('')
  const [currentGuessR, setCurrentGuessR] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isGameWonR, setIsGameWonR] = useState(false)
  const [isRandomMode, setIsRandomMode] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false)
  const [isMigrateStatsModalOpen, setIsMigrateStatsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [currentRowClass, setCurrentRowClass] = useState('')
  const [isGameLost, setIsGameLost] = useState(false)
  const [isGameLostR, setIsGameLostR] = useState(false)
  const [randomSolution, setRandomSolution] = useState(solutionR)
  const [randomExplanation, setRandomExplanation] = useState(explanationR)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : prefersDarkMode
      ? true
      : false
  )

  const [isHighContrastMode, setIsHighContrastMode] = useState(
    getStoredIsHighContrastMode()
  )

  const [isRevealing, setIsRevealing] = useState(false)

  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage(isLatestGame, false)

    const currentSolution = isRandomMode ? randomSolution : solution

    if (loaded?.solution !== currentSolution) {
      return []
    }

    const gameWasWon = loaded.guesses.includes(currentSolution)
    if (gameWasWon) {
      setIsGameWon(true)
    }

    if (loaded.guesses.length === challenges && !gameWasWon) {
      setIsGameLost(true)
      const currentExplanation = isRandomMode ? randomExplanation : explanation
      showErrorAlert(
        CORRECT_WORD_MESSAGE(currentSolution, currentExplanation),
        {
          durationMs: ALERT_TIME_MS,
        }
      )
    }
    return loaded.guesses
  })

  const [guessesR, setGuessesR] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage(isLatestGame, true)

    const currentSolution = isRandomMode ? randomSolution : solution

    if (loaded?.solution !== currentSolution) {
      return []
    }
    const gameWasWonR = loaded.guesses.includes(currentSolution)

    if (loaded.guesses.length === challenges && !gameWasWonR) {
      const currentExplanation = isRandomMode ? randomExplanation : explanation
      showErrorAlert(
        CORRECT_WORD_MESSAGE(currentSolution, currentExplanation),
        {
          durationMs: ALERT_TIME_MS,
        }
      )
    }
    return loaded.guesses
  })

  const [stats, setStats] = useState(() => loadStats())

  const [isHardMode, setIsHardMode] = useState(
    localStorage.getItem('gameMode')
      ? localStorage.getItem('gameMode') === 'hard'
      : false
  )

  useEffect(() => {
    // if no game state on load,
    // show the user the how-to info modal
    if (!loadGameStateFromLocalStorage(true, false)) {
      setTimeout(() => {
        setIsInfoModalOpen(true)
      }, WELCOME_INFO_MODAL_MS)
    }
  })

  useEffect(() => {
    DISCOURAGE_INAPP_BROWSERS &&
      isInAppBrowser() &&
      showErrorAlert(DISCOURAGE_INAPP_BROWSER_TEXT, {
        persist: false,
        durationMs: 7000,
      })
  }, [showErrorAlert])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isHighContrastMode) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [isDarkMode, isHighContrastMode])

  const handleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  const newRandomWord = () => {
    const index = getRandomWordIndex()
    setRandomSolution(getRandomWord(index))
    setRandomExplanation(getRandomExplanation(index))
    setCurrentGuessR('')
    setIsGameLostR(false)
    setIsGameWonR(false)
    setGuessesR([])
    return
  }

  const isWinningWordR = (word: string) => {
    return randomSolution === word
  }

  const switchRandomMode = (isRandom: boolean) => {
    return handleRandomMode(isRandom)
  }

  const handleRandomMode = (isRandom: boolean) => {
    console.log(isRandom)

    if (isRandom) {
      setWordLength(WORDLENGTHR)
      setChallenges(CHALLENGESR)
    } else {
      setWordLength(WORDLENGTH)
      setChallenges(CHALLENGES)
    }
    setIsRandomMode(isRandom)
  }

  const handleHardMode = (isHard: boolean) => {
    if (guesses.length === 0 || localStorage.getItem('gameMode') === 'hard') {
      setIsHardMode(isHard)
      localStorage.setItem('gameMode', isHard ? 'hard' : 'normal')
    } else {
      showErrorAlert(HARD_MODE_ALERT_MESSAGE)
    }
  }

  const handleHighContrastMode = (isHighContrast: boolean) => {
    setIsHighContrastMode(isHighContrast)
    setStoredIsHighContrastMode(isHighContrast)
  }

  const clearCurrentRowClass = () => {
    setCurrentRowClass('')
  }

  useEffect(() => {
    if (!isRandomMode) {
      saveGameStateToLocalStorage(
        getIsLatestGame(),
        { guesses, solution },
        isRandomMode
      )
    } else {
      //console.log("saving random");
      const guesses = guessesR
      const solution = randomSolution
      saveGameStateToLocalStorage(
        getIsLatestGame(),
        { guesses, solution },
        isRandomMode
      )
      console.log(solution)
    }
  }, [guesses, isRandomMode, guessesR, randomSolution])

  useEffect(() => {
    if (isGameWon && !isRandomMode) {
      const winMessage = explanation
      //console.log('getting winmessage')
      //console.log(winMessage)
      //      const delayMs = REVEAL_TIME_MS * MAX_WORD_LENGTH
      //      const winMessage =
      //        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      const delayMs = REVEAL_TIME_MS * wordLength

      showSuccessAlert(winMessage, {
        delayMs,
        durationMs: ALERT_TIME_MS,
        onClose: () => setIsStatsModalOpen(true),
      })
    } else if (isGameWonR && isRandomMode) {
      const winMessage = randomExplanation
      const delayMs = REVEAL_TIME_MS * wordLength

      showSuccessAlert(winMessage, {
        delayMs,
        durationMs: ALERT_TIME_MS,
      })
    }

    const currentSolution = isRandomMode ? randomSolution : solution

    if (isGameLost && !isRandomMode) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, (currentSolution.length + 1) * REVEAL_TIME_MS)
    } else if (isGameLostR) {
    }
  }, [
    isGameWon,
    isGameLost,
    isGameWonR,
    isGameLostR,
    showSuccessAlert,
    isRandomMode,
    randomExplanation,
    randomSolution,
    wordLength,
  ])

  const onChar = (value: string) => {
    if (
      !isRandomMode &&
      unicodeLength(`${currentGuess}${value}`) <= wordLength &&
      guesses.length < challenges &&
      !isGameWon
    ) {
      setCurrentGuess(`${currentGuess}${value}`)
    } else if (
      isRandomMode &&
      unicodeLength(`${currentGuessR}${value}`) <= wordLength &&
      guessesR.length < challenges &&
      !isGameWonR
    ) {
      setCurrentGuessR(`${currentGuessR}${value}`)
    }
  }

  const onDelete = () => {
    if (!isRandomMode) {
      setCurrentGuess(
        new GraphemeSplitter()
          .splitGraphemes(currentGuess)
          .slice(0, -1)
          .join('')
      )
    } else {
      setCurrentGuessR(
        new GraphemeSplitter()
          .splitGraphemes(currentGuessR)
          .slice(0, -1)
          .join('')
      )
    }
  }

  const onEnter = () => {
    console.log('on enter')
    if (!isRandomMode) {
      if (isGameWon || isGameLost) {
        return
      }
    } else {
      if (isGameWonR || isGameLostR) {
        return
      }
    }

    const cg = isRandomMode ? currentGuessR : currentGuess
    const guessesAll = isRandomMode ? guessesR : guesses

    if (!(unicodeLength(cg) === wordLength)) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }

    const inWordList = isRandomMode
      ? isWordInWordListR(cg)
      : isWordInWordList(cg)
    if (!inWordList) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(WORD_NOT_FOUND_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }

    // enforce hard mode - all guesses must contain all previously revealed letters
    if (isHardMode) {
      const firstMissingReveal = findFirstUnusedReveal(cg, guessesAll)
      if (firstMissingReveal) {
        setCurrentRowClass('jiggle')
        return showErrorAlert(firstMissingReveal, {
          onClose: clearCurrentRowClass,
        })
      }
    }

    setIsRevealing(true)
    // turn this back off after all
    // chars have been revealed
    setTimeout(() => {
      setIsRevealing(false)
    }, REVEAL_TIME_MS * wordLength)

    const winningWord = isRandomMode
      ? isWinningWordR(currentGuessR)
      : isWinningWord(currentGuess)

    if (
      !isRandomMode &&
      unicodeLength(currentGuess) === wordLength &&
      guesses.length < challenges &&
      !isGameWon
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess('')

      if (winningWord) {
        if (isLatestGame) {
          setStats(addStatsForCompletedGame(stats, guesses.length))
        }
        return setIsGameWon(true)
      }

      if (guesses.length === CHALLENGES - 1) {
        if (isLatestGame) {
          setStats(addStatsForCompletedGame(stats, guesses.length + 1))
        }
        setIsGameLost(true)
        const currentSolution = isRandomMode ? randomSolution : solution
        console.log('current solution B')
        console.log(currentSolution)
        const currentExplanation = isRandomMode
          ? randomExplanation
          : explanation
        showErrorAlert(
          CORRECT_WORD_MESSAGE(currentSolution, currentExplanation),
          {
            durationMs: ALERT_TIME_MS,
            //          delayMs: REVEAL_TIME_MS * MAX_WORD_LENGTH + 1,
            delayMs: REVEAL_TIME_MS * wordLength + 1,
          }
        )
      }
    } else if (
      isRandomMode &&
      unicodeLength(currentGuessR) === wordLength &&
      guessesR.length < challenges &&
      !isGameWonR
    ) {
      setGuessesR([...guessesR, currentGuessR])
      setCurrentGuessR('')

      if (winningWord) {
        return setIsGameWonR(true)
      }

      if (guessesR.length === CHALLENGESR - 1) {
        setIsGameLostR(true)
        const currentSolution = isRandomMode ? randomSolution : solution
        const currentExplanation = isRandomMode
          ? randomExplanation
          : explanation
        console.log('current solution C')
        console.log(currentSolution)
        showErrorAlert(
          CORRECT_WORD_MESSAGE(currentSolution, currentExplanation),
          {
            durationMs: ALERT_TIME_MS,
            delayMs: REVEAL_TIME_MS * wordLength + 1,
          }
        )
      }
    }
  }

  return (
    <Div100vh>
      <div className="flex h-full flex-col">
        <Navbar
          setIsInfoModalOpen={setIsInfoModalOpen}
          setIsStatsModalOpen={setIsStatsModalOpen}
          setIsDatePickerModalOpen={setIsDatePickerModalOpen}
          setIsSettingsModalOpen={setIsSettingsModalOpen}
          setIsUpdateModalOpen={setIsUpdateModalOpen}
        />

        {!isLatestGame && (
          <div className="flex items-center justify-center">
            <ClockIcon className="h-6 w-6 stroke-gray-600 dark:stroke-gray-300" />
            <p className="text-base text-gray-600 dark:text-gray-300">
              {format(gameDate, 'd MMMM yyyy', { locale: DATE_LOCALE })}
            </p>
          </div>
        )}

        <div className="mx-auto flex w-full grow flex-col px-1 pt-2 pb-8 sm:px-6 md:max-w-7xl lg:px-8 short:pb-2 short:pt-2">
          {
            <p className="text-center text-sm text-gray-500 dark:text-gray-300">
              ! for news (last update July 2024)
            </p>
          }
          <div className="flex flex-col justify-center pb-6 short:pb-2">
            <button
              className="mt-2 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
              onClick={() => switchRandomMode(!isRandomMode)}
            >
              {isRandomMode ? SWITCH_WOTD_MESSAGE : SWITCH_RANDOM_MESSAGE}
            </button>
          </div>
          <Keyboard
            onChar={onChar}
            onDelete={onDelete}
            onEnter={onEnter}
            solution={isRandomMode ? randomSolution : solution}
            guesses={isRandomMode ? guessesR : guesses}
            isRevealing={isRevealing}
          />
          <div className="flex grow flex-col justify-center pb-6 short:pb-2">
            <Grid
              solution={isRandomMode ? randomSolution : solution}
              guesses={isRandomMode ? guessesR : guesses}
              currentGuess={isRandomMode ? currentGuessR : currentGuess}
              isRevealing={isRevealing}
              currentRowClassName={currentRowClass}
              wordLength={wordLength}
              challenges={challenges}
            />
          </div>
          {isRandomMode && (isGameWonR || isGameLostR) && (
            <div className="flex flex-col justify-center pb-6 short:pb-2">
              <button
                className="mt-2 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                onClick={() => newRandomWord()}
              >
                New Random Word
              </button>
            </div>
          )}

          <InfoModal
            isOpen={isInfoModalOpen}
            handleClose={() => setIsInfoModalOpen(false)}
          />
          <UpdateModal
            isOpen={isUpdateModalOpen}
            handleClose={() => setIsUpdateModalOpen(false)}
          />
          <StatsModal
            isOpen={isStatsModalOpen}
            handleClose={() => setIsStatsModalOpen(false)}
            solution={isRandomMode ? randomSolution : solution}
            guesses={isRandomMode ? guessesR : guesses}
            gameStats={stats}
            isLatestGame={isLatestGame}
            isGameLost={isGameLost}
            isGameWon={isGameWon}
            handleShareToClipboard={() => showSuccessAlert(GAME_COPIED_MESSAGE)}
            handleShareFailure={() =>
              showErrorAlert(SHARE_FAILURE_TEXT, {
                durationMs: ALERT_TIME_MS,
              })
            }
            handleMigrateStatsButton={() => {
              setIsStatsModalOpen(false)
              setIsMigrateStatsModalOpen(true)
            }}
            isHardMode={isHardMode}
            isDarkMode={isDarkMode}
            isHighContrastMode={isHighContrastMode}
            numberOfGuessesMade={guesses.length}
          />
          <DatePickerModal
            isOpen={isDatePickerModalOpen}
            initialDate={solutionGameDate}
            handleSelectDate={(d) => {
              setIsDatePickerModalOpen(false)
              setGameDate(d)
            }}
            handleClose={() => setIsDatePickerModalOpen(false)}
          />
          <MigrateStatsModal
            isOpen={isMigrateStatsModalOpen}
            handleClose={() => setIsMigrateStatsModalOpen(false)}
          />
          <SettingsModal
            isOpen={isSettingsModalOpen}
            handleClose={() => setIsSettingsModalOpen(false)}
            isHardMode={isHardMode}
            handleHardMode={handleHardMode}
            isDarkMode={isDarkMode}
            handleDarkMode={handleDarkMode}
            isHighContrastMode={isHighContrastMode}
            handleHighContrastMode={handleHighContrastMode}
          />
          <AlertContainer />
        </div>
      </div>
    </Div100vh>
  )
}

export default App
