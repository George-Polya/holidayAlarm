declare module 'react-native-sound' {
  export default class Sound {
    static MAIN_BUNDLE: string;
    static setCategory(category: string, mixWithOthers?: boolean): void;
    constructor(
      filename: string | number,
      basePath?: string | number,
      onLoad?: (error?: any) => void
    );
    play(onEnd?: (success: boolean) => void): void;
    stop(onStop?: () => void): void;
    release(): void;
    setVolume(volume: number): void;
    setNumberOfLoops(value: number): void;
  }
}

