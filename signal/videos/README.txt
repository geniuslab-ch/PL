Drop the real panna/football clip here as:

    panna-move.mp4

Recommended specs (this loads on mobile data over a QR scan, so keep it light):
- Format: H.264 MP4
- Duration: ~8-15 seconds
- Resolution: 720p is plenty (this is a small portrait video box, not fullscreen)
- File size: aim for under 3-4MB — compress with HandBrake or ffmpeg, e.g.:

    ffmpeg -i source.mov -vcodec h264 -crf 28 -preset slow -an panna-move.mp4

(-an strips audio since the video is muted/looped anyway — saves size)

The path is read from ONE place: /signal/signal-config.js → VIDEO_PATH
If you rename the file or use a different format, update that one line —
nothing else needs to change.

The video is lazy-loaded: it only downloads once the visitor taps the
play button on the "1 VS 1." screen, not on page load.
