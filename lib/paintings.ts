export interface Painting {
  id: string;
  src: string;
  title: string;
  artist: string;
  year?: string;
  location?: string;
  context?: string;
  references?: string;
  analysis?: string;
  message?: string;
}

export const PAINTINGS: Painting[] = [
  {
    id: "tree-of-knowledge",
    src: "Tree_of_Knowledge_No._2,_Hilma_af_Klint,_1913-1915,_Glenstone_2023.jpg",
    title: "Tree of Knowledge No. 2",
    artist: "Hilma af Klint",
    year: "1913-1915",
    location: "Glenstone",
    context: "Created during her visionary series exploring unseen spiritual realities, this work reflects early abstract art shaped by inner experience rather than external observation.",
    references: "Influenced by Theosophy and Anthroposophy, especially ideas about spiritual evolution and hidden structures of existence.",
    analysis: "The branching forms rise with quiet symmetry, soft colors unfolding like thoughts made visible. Circles and lines suggest growth beyond the physical, giving the composition a calm, meditative rhythm.",
    message: "Knowledge is not only learned but awakened; the painting invites a sense that truth grows inwardly, like a tree rooted in the invisible.",
  },
  {
    id: "bouddha",
    src: "bouddha-redon.jpg",
    title: "Bouddha",
    artist: "Odilon Redon",
    year: "1904",
    location: "Van Gogh Museum",
    context: "Created around 1906–1907 during Odilon Redon's later, more colorful period, this work reflects his shift from dark, symbolic lithographs to luminous paintings influenced by spiritualism, Eastern philosophy, and Symbolism.",
    references: "The figure represents Siddhartha Gautama (Buddha), drawing from Buddhist philosophy—especially themes of enlightenment, inner peace, and transcendence. It also reflects Symbolist interests in mysticism and the unseen.",
    analysis: "The glowing, serene figure contrasts with the darker, natural surroundings, suggesting spiritual awakening emerging from material reality. The use of soft, radiant colors around the head evokes enlightenment or aura. The closed eyes and calm posture symbolize introspection and detachment from worldly suffering.",
    message: "Inner enlightenment emerges as a path beyond suffering, where silence, contemplation, and transcendence rise above material existence."
  },
  {
    id: "closed-eyes",
    src: "closed_eyes_odilon_redon.jpg",
    title: "Closed Eyes",
    artist: "Odilon Redon",
    year: "1890",
    location: "Musée d'Orsay",
    context: "Created during Odilon Redon’s Symbolist period, this work reflects his interest in the inner world, dreams, and the mysterious realm of the subconscious.",
    references: "Connected to Symbolism, which sought to express ideas and emotions through suggestion and metaphor rather than direct representation. The subject also echoes Buddhist themes of meditation and inner vision.",
    analysis: "The composition centers on a face with closed eyes, rendered with soft, ambiguous features. The background dissolves into a hazy, dreamlike atmosphere, with muted colors that enhance the sense of introspection. The figure seems both present and distant, as if caught between waking and dreaming.",
    message: "The painting suggests that true perception lies within, beyond the visible world; it invites viewers to consider the power of inner vision and the quiet intensity of the contemplative mind."

  },
  {
    id: "henri-rousseau-banks",
    src: "henri-rousseau-the-banks-of-the-bievre.jpg",
    title: "The Banks of the Bièvre",
    artist: "Henri Rousseau",
    year: "1908-1909",
    location: "Metropolitan Museum of Art",
    context: "Painted during Rousseau’s later period, this work reflects his characteristic blend of naive style, detailed observation, and imaginative reimagining of the everyday.",
    references: "Connected to the School of Paris and the broader Symbolist interest in the poetic potential of ordinary scenes, though Rousseau himself claimed to have no artistic influences.",
    analysis: "The composition presents a familiar Parisian landscape—the Bièvre river—rendered with Rousseau’s distinctive clarity and flattened perspective. The colors are vibrant yet controlled, and the forms possess a quiet monumentality. The atmosphere feels both tranquil and slightly dreamlike, as if the scene exists in a space between memory and imagination.",
    message: "The painting suggests that even ordinary places hold a hidden poetry; it invites viewers to look closely at the world around them and discover the beauty in the familiar."

  },
  {
    id: "la-famille",
    src: "la_famille_paul_guiragossian.jpg",
    title: "La Famille",
    artist: "Paul Guiragossian",
    year: "1962",
    location: "Private Collection",
    context: "Created during a period of political and social upheaval in Lebanon, this work reflects Guiragossian’s deep connection to his homeland and his exploration of universal human themes.",
    references: "Influenced by Byzantine art, Armenian cultural heritage, and modern European masters like Rouault and Picasso, Guiragossian developed a unique style that blended spiritual depth with expressive figuration.",
    analysis: "The composition centers on a close grouping of figures, rendered with bold, simplified forms and a rich, earthy palette. The figures overlap and merge, suggesting both intimacy and a shared sense of resilience. The overall atmosphere feels both grounded and transcendent, as if the family unit holds a quiet, enduring strength.",
    message: "Communicates the enduring power of family—a source of connection, memory, and continuity amidst change. It suggests that human bonds carry a deep, unspoken presence that shapes who we are."

  },
  {
    id: "schweres-rot",
    src: "schweres-rot-wassily-kandinsky.jpg",
    title: "Schweres Rot",
    artist: "Wassily Kandinsky",
    year: "1924",
    location: "Kunstmuseum Basel",
    context: "Created during Kandinsky’s Bauhaus period, this work reflects his mature exploration of abstraction as a language of inner necessity and emotional resonance.",
    references: "Informed by his theories on color and form, where red carries vitality and weight, and by spiritual ideas linking art to inner states.",
    analysis: "A dense red form anchors the composition, surrounded by contrasting shapes and lines that feel both tense and harmonious. The colors press against each other, creating a sense of gravity and contained energy.",
    message: "Emotion can have weight and presence; the painting suggests that inner intensity, though unseen, shapes the structure of our experience."
  },
  {
    id: "what-a-human-being-is",
    src: "what-a-human-being-is-Hilma_af_Klint.jpg",
    title: "What a Human Being Is",
    artist: "Hilma af Klint",
    year: "1910",
    location: "Hilma af Klint Foundation",
    context: "Part of her spiritual diagrams, this work seeks to map the invisible dimensions of human existence beyond the physical body.",
    references: "Rooted in Theosophy and esoteric Christianity, reflecting ideas of duality, soul evolution, and hidden energies within the human form.",
    analysis: "The composition unfolds like a symbolic blueprint, with mirrored shapes and soft contrasts suggesting balance between inner forces. Colors and forms feel both structured and alive, as if revealing a quiet, unseen anatomy of the spirit.",
    message: "To be human is to hold both visible and invisible worlds within; the painting suggests that identity is a harmony of body, soul, and something eternal unfolding.",
  },
  {
    id: "the-swan",
    src: "the-swan-Hilma_af_Klint_-_Group_IX_.jpg",
    title: "The Swan (Group IX)",
    artist: "Hilma af Klint",
    year: "1914-1915",
    location: "Hilma af Klint Foundation",
    context: "Part of her larger spiritual series, this work explores duality and transformation through abstract symbolism during the early rise of non-representational art.",
    references: "Draws on Theosophy and symbolic traditions where the swan represents purity, union, and the meeting of opposites—light and dark, male and female.",
    analysis: "Contrasting black and white forms face and merge, creating a quiet tension that feels both divided and whole. The geometry is restrained yet alive, suggesting a moment where opposites begin to dissolve into unity.",
    message: "The painting speaks of reconciliation—of opposing forces finding harmony, and the possibility that true balance emerges from embracing both sides of existence."  
  },
  {
    id: "gustav-klimt-009",
    src: "Gustav_Klimt_009.jpg",
    title: "Lady with Hat and Feather Boa",
    artist: "Gustav Klimt",
    year: "1909",
    location: "Private Collection",
    context: "Painted during Klimt’s mature period in Vienna, this portrait reflects a shift toward expressive elegance and psychological presence beyond strict realism.",
    references: "Influenced by Art Nouveau aesthetics and the culture of fin-de-siècle Vienna, where fashion, identity, and sensuality intertwined.",
    analysis: "The figure emerges through soft, almost dissolving brushstrokes, her face vivid against the haze of feathers and fabric. The dark hat and flowing boa frame her with a sense of mystery, while the looseness of form gives the portrait a fleeting, dreamlike quality.",
    message: "The painting suggests identity as something both revealed and concealed—an intimate presence that resists being fully known, lingering between confidence and enigma."
  },
  {
    id: "the-bootleggers",
    src: "The_Bootleggers_Edward_Hopper_1925.jpg",
    title: "The Bootleggers",
    artist: "Edward Hopper",
    year: "1925",
    location: "Currier Museum of Art",
    context: "This work reflects Hopper’s broader exploration of modern American life, often centered on isolation, quiet tension, and the emotional weight of ordinary settings.",
    references: "Connected to American realism and the social atmosphere of Prohibition-era culture, where secrecy and nightlife carried a charged undertone.",
    analysis: "Figures are likely placed within a subdued, restrained composition where light feels both revealing and isolating. The atmosphere carries stillness, as if conversation and intention are suspended in time.",
    message: "Even in moments of connection or exchange, there remains a quiet distance between people; the painting suggests that modern life often hides solitude beneath shared spaces."

  }
];

export const getPaintingPath = (src: string) => `/homepagepaintings/${encodeURIComponent(src)}`;
