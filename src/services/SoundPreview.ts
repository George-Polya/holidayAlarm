import Sound from 'react-native-sound';
import { Platform } from 'react-native';

// iOS에서 무음 스위치와 상관없이 재생되도록 카테고리 설정
try {
  Sound.setCategory('Playback');
} catch (e) {
  // noop
}

// 플랫폼별 번들 파일명 매핑 (iOS: .wav in main bundle, Android: res/raw .mp3)
const SOUND_FILES: Record<string, { ios: string; android: string }> = {
  analog_alarm: { ios: 'analog_alarm.wav', android: 'analog_alarm.mp3' },
  digital_alarm: { ios: 'digital_alarm.wav', android: 'digital_alarm.mp3' },
};

class SoundPreviewService {
  private current?: Sound;
  private currentId?: string;
  private playing = false;
  private onChange?: (playingId: string | null) => void;

  setListener(cb?: (playingId: string | null) => void) {
    this.onChange = cb;
  }

  isPlaying(id?: string) {
    if (!id) return this.playing;
    return this.playing && this.currentId === id;
  }

  stop() {
    if (this.current) {
      try {
        this.current.stop(() => {
          this.current?.release();
          this.current = undefined;
          this.currentId = undefined;
          this.playing = false;
          this.onChange?.(null);
        });
      } catch (e) {
        // ignore
        this.current?.release();
        this.current = undefined;
        this.currentId = undefined;
        this.playing = false;
        this.onChange?.(null);
      }
    }
  }

  play(id: string) {
    const map = SOUND_FILES[id];
    if (!map) {
      // 등록되지 않은 경우 중단
      this.stop();
      return;
    }

    // 같은 소리 재생 중이면 정지 토글
    if (this.current && this.currentId === id && this.playing) {
      this.stop();
      return;
    }

    // 다른 소리 재생 중이면 정리
    if (this.current) {
      try { this.current.release(); } catch {}
      this.current = undefined;
    }

    this.currentId = id;
    const filename = Platform.OS === 'ios' ? map.ios : map.android;
    const s = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        this.playing = false;
        this.onChange?.(null);
        return;
      }
      this.playing = true;
      this.onChange?.(id);
      s.play((success) => {
        this.playing = false;
        try { s.release(); } catch {}
        if (this.current === s) {
          this.current = undefined;
          this.currentId = undefined;
        }
        this.onChange?.(null);
      });
    });
    this.current = s;
  }
}

export default new SoundPreviewService();
