import { useContext, useRef, useEffect, useState } from "react";
import Image from "next/image";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { PlayerContext } from "../../contexts/PlayerContext";

import styles from "./styles.module.scss";
import { convertDuration2TimeStr } from "../../utils/convertDuration2TimeStr";

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    togglePlay,
    setPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    isLooping,
    toggleLoop,
    isShuffling,
    toggleShuffle,
    clearPlayerState,
  } = useContext(PlayerContext);

  useEffect(() => {
    if (audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const currentEpisode = episodeList[currentEpisodeIndex];

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener("timeupdate", () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora {currentEpisode?.title}</strong>
      </header>

      {currentEpisode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={currentEpisode.thumbnail}
            objectFit="cover"
          />
          <strong>{currentEpisode.title}</strong>
          <span>{currentEpisode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!currentEpisode ? styles.empty : ""}>
        <div className={styles.progress}>
          <span>{convertDuration2TimeStr(progress)}</span>
          <div className={styles.slider}>
            {currentEpisode ? (
              <Slider
                max={currentEpisode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: "#04d361" }}
                railStyle={{ backgroundColor: "#9f75ff" }}
                handleStyle={{ borderColor: "#04d361", borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDuration2TimeStr(currentEpisode?.duration ?? 0)}</span>
        </div>

        {currentEpisode && (
          <audio
            src={currentEpisode.url}
            ref={audioRef}
            loop={isLooping}
            onEnded={handleEpisodeEnded}
            autoPlay
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>
          <button
            type="button"
            disabled={!currentEpisode || episodeList.length === 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ""}
          >
            <img src="/shuffle.svg" alt="Embaralhar podcats" />
          </button>
          <button
            type="button"
            onClick={playPrevious}
            disabled={!currentEpisode || !hasPrevious}
          >
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!currentEpisode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src="/pause.svg" alt="Pausar" />
            ) : (
              <img src="/play.svg" alt="Tocar" />
            )}
          </button>
          <button
            type="button"
            onClick={playNext}
            disabled={!currentEpisode || !hasNext}
          >
            <img src="/play-next.svg" alt="Tocar próximo" />
          </button>
          <button
            type="button"
            disabled={!currentEpisode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ""}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
