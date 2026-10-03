// ============================================================
// ST. ANNA CHOR – SONG-BIBLIOTHEK
// Hier werden neue Stücke eingetragen.
// Die eigentliche App (script.js) muss dafür nicht geändert werden.
// ============================================================

const songs = [
  {
    id: "rutter-lord-bless-you",
    title: "The Lord Bless You and Keep You",
    composer: "John Rutter",
    tracks: [
      { name: "Klavier", file: "audio/klavier.mp3", defaultVolume: 80 },
      { name: "Sopran", file: "audio/sopran.mp3", defaultVolume: 80 },
      { name: "Alt", file: "audio/alt.mp3", defaultVolume: 80 },
      { name: "Tenor", file: "audio/tenor.mp3", defaultVolume: 80, boost: 1.5 },
      { name: "Bass", file: "audio/bass.mp3", defaultVolume: 80, boost: 1.5 }
    ],
    sheets: [
      { from: 0, file: "noten/noten-seite-1.jpg" },
      { from: 21, file: "noten/noten-seite-2.jpg" },
      { from: 69, file: "noten/noten-seite-3.jpg" },
      { from: 114, file: "noten/noten-seite-4.jpg" }
    ]
  },

  // STÜCK 2
  {
    id: "der-herr-ist-mein-hirt",
    title: "Der Herr ist mein Hirt",
    composer: "Bernhard Klein",
    tracks: [
      { name: "Klavier", file: "audio/der-herr-ist-mein-hirt/klavier.mp3", defaultVolume: 80 },
      { name: "Sopran", file: "audio/der-herr-ist-mein-hirt/sopran.mp3", defaultVolume: 80 },
      { name: "Alt", file: "audio/der-herr-ist-mein-hirt/alt.mp3", defaultVolume: 80 },
      { name: "Tenor", file: "audio/der-herr-ist-mein-hirt/tenor.mp3", defaultVolume: 80, boost: 1.5 },
      { name: "Bass", file: "audio/der-herr-ist-mein-hirt/bass.mp3", defaultVolume: 80, boost: 1.5 }
    ],
    sheets: [
      { from: 0, file: "noten/der-herr-ist-mein-hirt/seite-1.jpeg" },
      { from: 9999, file: "noten/der-herr-ist-mein-hirt/seite-2.jpeg" }
    ]
  },
  // STÜCK 3
  { id: "song-3", title: "Stück 3", composer: "Demnächst", placeholder: true },

  // STÜCK 4
  { id: "song-4", title: "Stück 4", composer: "Demnächst", placeholder: true },

  // STÜCK 5
  { id: "song-5", title: "Stück 5", composer: "Demnächst", placeholder: true }
];
