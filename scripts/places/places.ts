import type { NewPlace } from '../../src/db/schema';

// The Places directory, as reviewable data. `npm run places:sync` upserts every
// entry into the `places` table (keyed on `id`). To add a place, append an entry
// here and run the sync — see docs/product/places.md.
//
// `aliases`: every other spelling events use for this place (venue, organiser
// or scraper source name). Events link to a place when one of their names
// matches `name`/`aliases` after slug-normalization, in the same `city`.
//
// Researched 2026-09-27 from each place's own website; coords via OpenStreetMap
// Nominatim. Leave a field null rather than guess.

export const PLACES: NewPlace[] = [
  // --- Backfilled from existing events ---
  {
    id: 'ajuda-lab',
    slug: 'ajuda-lab',
    name: 'Ajuda Lab',
    kind: 'both',
    category: 'workshop-space',
    description:
      'Art and craft workshop atelier inside Mercado da Ajuda — small-group workshops in jewellery wax modelling, painting, macramé, candle-making and design, plus team-building sessions.',
    imageUrl:
      'https://pn4cabqkop1baqwd.public.blob.vercel-storage.com/organisers/ajuda-lab-MfQ7YXe6004iyJTLevo4P13jp2tJsZ.webp',
    address: 'Mercado da Ajuda, Travessa de Dom Vasco, 1300-102 Lisboa',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.7033624,
    lng: -9.1950488,
    websiteUrl: 'https://ajudalab.pt/',
    instagramUrl: 'https://www.instagram.com/ajudalab',
  },
  {
    id: 'disco-wheel',
    slug: 'disco-wheel',
    name: 'Disco Wheel',
    kind: 'both',
    category: 'studio',
    description:
      'Ceramic studio and shop in central Lisbon: 90-minute drop-in pottery workshops with a teacher, in a space with dimmed lights, music and scents. Also available for private events.',
    imageUrl: '/venues/disco-wheel.jpg',
    address: 'Rua de São Paulo 150, Lisboa',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.7081509,
    lng: -9.1453405,
    websiteUrl: 'https://discowheel.com/',
    instagramUrl: 'https://www.instagram.com/disco.wheel',
  },
  {
    id: 'pink-dolphin',
    slug: 'pink-dolphin',
    name: 'Pink Dolphin',
    aliases: ['Pink Dolphin Lisbon', 'PinkDolphinLisbon'],
    kind: 'both',
    category: 'shop',
    description:
      'A little kitsch, a lot of fun: a shop in central Lisbon for affordable art, artisan work and independent small brands, which also hosts creative workshops.',
    imageUrl: 'https://pinkdolphinlisbon.com/cdn/shop/files/PDLogos-04.jpg?v=1696864293',
    address: 'Rua Poço dos Negros 37, 1200-035 Lisboa',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.7100934, // street-level (Nominatim had no house number)
    lng: -9.1510711,
    websiteUrl: 'https://pinkdolphinlisbon.com/',
    openingHours: {
      mon: '11:00-18:00', tue: '11:00-18:00', wed: '11:00-18:00',
      thu: '11:00-18:00', fri: '11:00-18:00', sat: '11:00-18:00',
    },
  },
  {
    id: 'nacre-creative',
    slug: 'nacre-creative',
    name: 'Nacre Creative',
    aliases: ['Nacre Creative Budapest'],
    kind: 'both',
    category: 'studio',
    description:
      'Creative studio in downtown Budapest running jewellery-making and craft workshops, and selling DIY jewellery kits.',
    address: 'Veres Pálné utca 40, 1053 Budapest',
    city: 'Budapest',
    country: 'Hungary',
    lat: 47.4886419,
    lng: 19.058502,
    websiteUrl: 'https://nacrecreative.com/',
    instagramUrl: 'https://www.instagram.com/nacre.creative',
  },
  {
    id: 'dvi-taures-meno',
    slug: 'dvi-taures-meno',
    name: 'Dvi Taurės meno',
    aliases: ['Dvi Taurės meno tapybos studija', 'Dvi Taurės Meno studija', '2 Taurės'],
    kind: 'both',
    category: 'studio',
    description:
      'Painting studio in Vilnius hosting guided "paint and sip" evenings — no experience needed, you leave with your own painting. Also runs plein-air sessions on the Curonian Spit.',
    address: 'S. Konarskio g. 35A, Vilnius',
    city: 'Vilnius',
    country: 'Lithuania',
    lat: 54.6797468,
    lng: 25.2542391,
    websiteUrl: 'https://www.2tauresmeno.lt/',
    instagramUrl: 'https://www.instagram.com/dvi_taures_meno',
    openingHours: { note: 'Open during events; ask about other times at +370 615 72864.' },
  },
  {
    id: 'la-biennale-di-venezia',
    slug: 'la-biennale-di-venezia',
    name: 'La Biennale di Venezia',
    aliases: ['La Biennale'],
    kind: 'organiser',
    category: 'other',
    description:
      'Venice institution behind the International Art and Architecture Exhibitions and the Biennale festivals of dance, theatre, music and cinema, held across the Giardini, the Arsenale and venues around the city.',
    imageUrl: '/venues/la-biennale.jpg',
    city: 'Venice',
    country: 'Italy',
    websiteUrl: 'https://www.labiennale.org/',
    instagramUrl: 'https://www.instagram.com/labiennale',
  },
  {
    id: 'art-home-lisbon',
    slug: 'art-home-lisbon',
    name: 'Art Home Lisbon',
    kind: 'organiser',
    category: 'other',
    description: 'Lisbon art organiser announcing its events on Instagram.',
    // Logo supplied by the operator 2026-10-22.
    imageUrl: 'https://pn4cabqkop1baqwd.public.blob.vercel-storage.com/places/art-home-lisbon-BtgU1ofSkugHU6poxW0wiEx2q0WgUO.jpg',
    city: 'Lisbon',
    country: 'Portugal',
    instagramUrl: 'https://www.instagram.com/arthome.lisbon',
  },
  {
    id: 'collage-club-ldn',
    slug: 'collage-club-ldn',
    name: 'Collage Club',
    aliases: ['Collage Club LDN'],
    kind: 'organiser',
    category: 'collective',
    description: 'London collage collective running social collage-making nights at venues around the city.',
    imageUrl:
      'https://static1.squarespace.com/static/59874988b8a79b27664867b3/t/59874d40be6594b05b39e414/1502039369271/Collage+Club+Logo_Coloured.jpg?format=1500w',
    city: 'London',
    country: 'United Kingdom',
    websiteUrl: 'https://collageclubldn.com/',
    instagramUrl: 'https://www.instagram.com/collageclubldn',
  },
  {
    id: 'oslo-hackney',
    slug: 'oslo-hackney',
    name: 'Oslo Hackney',
    aliases: ['Oslo'],
    kind: 'venue',
    category: 'other',
    description: 'Bar, restaurant and events venue next to Hackney Central station.',
    address: '1A Amhurst Road, London E8 1LL',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5471623,
    lng: -0.0556001,
    websiteUrl: 'https://oslohackney.com/',
  },
  {
    id: 'hostelis-el-nido',
    slug: 'hostelis-el-nido',
    name: 'Hostelis El Nido',
    kind: 'venue',
    category: 'other',
    description: 'Hostel in Nida on the Curonian Spit that hosts occasional plein-air painting sessions.',
    address: 'Naglių g. 20, Nida, Neringa',
    city: 'Neringa',
    country: 'Lithuania',
    lat: 55.3044589,
    lng: 21.0075743,
  },
  {
    id: 'vasaros-namai-kastytis',
    slug: 'vasaros-namai-kastytis',
    name: 'Vasaros namai Kastytis',
    kind: 'venue',
    category: 'other',
    description: 'Summer house in Nida on the Curonian Spit that hosts occasional plein-air painting sessions.',
    address: 'Pamario g. 47, Nida, Neringa',
    city: 'Neringa',
    country: 'Lithuania',
    lat: 55.309941,
    lng: 21.008877,
  },

  {
    id: 'fable-lisbon',
    slug: 'fable-lisbon',
    name: 'Fable',
    aliases: ['Fable Lisbon', 'fablelisbon', 'Fable Bookshop + Cafe', 'Fable - Cafe, Coffee, English Books'],
    kind: 'both',
    category: 'other',
    description:
      'English bookshop with specialty coffee and natural wine in Lisbon, "for the curious and creative". Hosts creative events and workshops: embroidery and storytelling workshops, a weekly writing night (The Writer\'s Hour) and open mic nights with music, poetry, spoken word and comedy.',
    // Photo supplied by the operator 2026-10-22.
    imageUrl: 'https://pn4cabqkop1baqwd.public.blob.vercel-storage.com/places/fable-lisbon-jTuhCTg9Bh1ICGFVME0xiXAfTpWN2M.jpg',
    address: 'Rua dos Prazeres 10A, 1200-820 Lisboa',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.7146874, // Nominatim: no. 10
    lng: -9.1525758,
    instagramUrl: 'https://www.instagram.com/fablelisbon/',
    websiteUrl: 'https://linktr.ee/fablelisbon',
  },

  {
    id: 'monique-clara',
    slug: 'monique-clara',
    name: 'Monique Clara Studio',
    aliases: ['Monique Clara Tufting Studio', 'Monique Clara', 'moniqueclara'],
    kind: 'both',
    category: 'studio',
    description:
      'Tufting studio and shop in Amsterdam West run by artist Monique Clara: hand-tufted rugs, mirrors and prints, plus small-group workshops (max 4) in beginner tufting, tufting for two, tufted mirrors, punch needle and embroidered photos. Also hosts private events.',
    imageUrl: 'https://assets.bigcartel.com/product_images/407292309/IMG_9042.jpeg',
    address: 'Condensatorweg 36, 1014 AX Amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    lat: 52.3897265, // Nominatim: no. 36
    lng: 4.851374,
    websiteUrl: 'https://www.moniqueclara.com/',
    instagramUrl: 'https://www.instagram.com/_monique.clara_/',
    openingHours: { note: 'Workshops only — book a session online or email the studio.' },
  },

  {
    id: 'oficina-mescla',
    slug: 'oficina-mescla',
    name: 'Oficina Mescla',
    aliases: ['Mescla'],
    kind: 'both',
    category: 'studio',
    description:
      'Printmaking studio in central Porto, opened in 2019 by Alexandra Rafael and Tomás Dias. Runs monthly courses in screenprinting, etching and lithography, one-off workshops (linocut, bookbinding, tetrapak printing), artist residencies, equipment rental and limited editions.',
    imageUrl: 'https://oficinamescla.com/wp-content/uploads/2026/07/OUT_seri.png',
    address: 'Pátio do Bolhão 90, 4000-110 Porto',
    city: 'Porto',
    country: 'Portugal',
    lat: 41.1515323, // Nominatim: Pátio do Bolhão (a small courtyard)
    lng: -8.6068191,
    websiteUrl: 'https://oficinamescla.com/en/',
    instagramUrl: 'https://www.instagram.com/oficinamescla/',
    openingHours: {
      mon: '14:00-18:00', tue: '14:00-18:00', wed: '14:00-18:00',
      thu: '14:00-18:00', fri: '14:00-18:00',
      note: 'Email ahead if you would like to visit.',
    },
  },

  {
    id: 'svet-space',
    slug: 'svet-space',
    name: 'SVET•LIGHT•LUZ',
    aliases: ['SVET', 'Svet Space', 'SVET LIGHT LUZ', 'svet__space'],
    kind: 'both',
    category: 'studio',
    description:
      'Art coworking space and ceramic studio in Porto (Paranhos), hosting workshops, events and Sunday sketching sessions. Events are announced on Instagram.',
    imageUrl: null, // Instagram-only; its CDN image URLs expire
    address: 'Rua do Visconde de Setúbal 157, 4200-499 Porto',
    city: 'Porto',
    country: 'Portugal',
    lat: 41.1636953, // street-level (Nominatim had no house number)
    lng: -8.6053118,
    websiteUrl: null,
    instagramUrl: 'https://www.instagram.com/svet__space/',
  },

  {
    id: 'dobarro',
    slug: 'dobarro',
    name: 'DoBarro',
    aliases: ['Do Barro', 'dobarro.art'],
    kind: 'both',
    category: 'studio',
    description:
      'Ceramics and visual-arts studio and shop in Porto, founded by artists and designers Marisa Grilo, Felipe Rocio and Samuel Sanção. Runs weekly workshops and courses in hand-building, nerikomi and tile painting, plus drawing, painting, printmaking (tetrapak, LEGO, cyanotype) and pinhole photography; also rents studio space and offers kiln firings.',
    imageUrl:
      'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1200,fit=crop/YBgeXyjjz9H06Bbb/whatsapp-image-2024-10-22-at-15.52.14-2-AMql0n3LE1Hon0Qv.jpeg',
    address: 'Rua da Alegria 246, Porto',
    city: 'Porto',
    country: 'Portugal',
    // No lat/lng: Nominatim has no house numbers on this long street; the map
    // link falls back to an address search, which is exact.
    websiteUrl: 'https://dobarro.art/',
    instagramUrl: 'https://www.instagram.com/dobarro.art',
    openingHours: {
      mon: '11:00-18:00', tue: '11:00-18:00', wed: '11:00-18:00',
      thu: '11:00-18:00', fri: '11:00-18:00', sat: '11:00-18:00',
    },
  },

  // --- Scraped sources with no current events ---
  {
    id: 'bryon-studios',
    slug: 'bryon-studios',
    name: 'Bryon Studios',
    kind: 'both',
    category: 'shop',
    description:
      'Stationery and art-supplies shop and studio in Santos, Lisbon, with Japanese stationery, cards and drawing tools, and occasional craft classes such as spoon carving.',
    // Photo supplied by the operator 2026-10-22.
    imageUrl: 'https://pn4cabqkop1baqwd.public.blob.vercel-storage.com/places/bryon-studios-opwANXawjOmTQRqYu7dGpHPdXqbsD4.jpg',
    address: 'Largo Vitorino Damásio 3C, Pavilhão 3, Lisboa',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.7070291,
    lng: -9.1534459,
    websiteUrl: 'https://www.bryonstudios.com/',
    instagramUrl: 'https://www.instagram.com/bryonstudios',
  },
  {
    id: 'macba',
    slug: 'macba',
    name: 'MACBA',
    aliases: ['MACBA Barcelona', "Museu d'Art Contemporani de Barcelona", 'Museum of Contemporary Art of Barcelona'],
    kind: 'both',
    category: 'museum',
    description:
      "Barcelona's Museum of Contemporary Art, in the Raval: exhibitions, a public programme of talks and screenings, publications and a study centre.",
    address: "Plaça dels Àngels 1, 08001 Barcelona",
    city: 'Barcelona',
    country: 'Spain',
    lat: 41.3827589,
    lng: 2.1670692,
    websiteUrl: 'https://www.macba.cat/en/',
    instagramUrl: 'https://www.instagram.com/macba_barcelona',
  },

  // --- Added by hand ---
  {
    id: 'galeria-1758',
    slug: 'galeria-1758',
    name: 'Galeria 1758',
    aliases: ['Galeria 1758 Lisboa', 'Atelier 1758'],
    kind: 'both',
    category: 'gallery',
    description:
      'Contemporary art gallery in Ajuda, Lisbon, born from the atelier of curator Cristina Cabrita, with a focus on accessible, inclusive art. Shows exhibitions by contemporary artists, sells original works and limited editions, and runs traditional azulejo (tile) painting workshops and custom group sessions.',
    imageUrl: 'https://galeria1758.pt/wp-content/uploads/2025/05/IMG_7104-copiar-scaled-e1753722927884.jpg',
    address: 'Travessa da Memória 47A, 1300-402 Lisboa',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.7027294, // street-level (Nominatim had no house number)
    lng: -9.2008251,
    websiteUrl: 'https://galeria1758.pt/',
    instagramUrl: 'https://www.instagram.com/galeria_1758/',
  },
  {
    id: 'kitulu',
    slug: 'kitulu',
    name: 'Kitulu',
    aliases: ['kitulu.pt', 'Kitulu Casa & Jardim'],
    kind: 'both',
    category: 'studio',
    description:
      'Contemporary floral art studio in Lisbon: flowers and plants for weddings and events, a weekly flower subscription ("Flor à Porta"), crafts and mini gardens.',
    imageUrl: 'https://pn4cabqkop1baqwd.public.blob.vercel-storage.com/places/kitulu-7Eq3EGIt9zMRIFp47LpVsvzyRZsRA0.jpg',
    address: 'Travessa da Boa Hora à Ajuda 31B, 1300-102 Lisboa',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.7033739, // Nominatim: next door (31A)
    lng: -9.1965145,
    instagramUrl: 'https://www.instagram.com/kitulu.pt/',
    openingHours: {
      mon: '10:00-18:00', tue: '10:00-18:00', wed: '10:00-18:00',
      thu: '10:00-18:00', fri: '10:00-18:00', sat: '10:00-16:00',
      note: 'Orders via WhatsApp or Instagram.',
    },
  },
  {
    id: 'salted-books',
    slug: 'salted-books',
    name: 'Salted Books',
    aliases: ['Salted Books Lisbon'],
    kind: 'both',
    category: 'shop',
    description:
      'English-language independent bookshop in Santos, Lisbon, that runs creative writing courses and workshops (fiction, memoir, essay, poetry), zine and journal-making workshops, book clubs and reading parties.',
    // Photo supplied by the operator 2026-10-22 (credit: Hung Nguyen).
    imageUrl: 'https://pn4cabqkop1baqwd.public.blob.vercel-storage.com/places/salted-books-mf7zgyCJwFxaSsAFEBmqaurqYar0Bm.webp',
    address: 'Calçada do Marquês de Abrantes 96, 1200-720 Lisboa',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.7078466, // Nominatim: Salted Books (shop node)
    lng: -9.1550847,
    websiteUrl: 'https://saltedbookslisbon.com/',
    instagramUrl: 'https://www.instagram.com/saltedbooks.lisbon/',
    openingHours: {
      tue: '10:00-18:30', wed: '10:00-18:30', thu: '10:00-18:30',
      fri: '10:00-18:30', sat: '10:00-18:30', sun: '10:00-17:30',
    },
  },
  {
    id: 'peanut-blu',
    slug: 'peanut-blu',
    name: 'Peanut Blu',
    aliases: ['Peanut Blu Arts & Crafts Studio', 'peanut.blu'],
    kind: 'both',
    category: 'workshop-space',
    description:
      'Arts and crafts studio in Lisbon, made mainly for adults who want to try something without committing to a course. Walk in and pick a materials pack (painting plant pots, watercolours, magnets, keyrings) for a 90-minute session, or book one of the weekly workshops (mosaic, resin, embroidery, beading, "& Sip" evenings). Also hosts private parties and team-building for 8+ people.',
    imageUrl: 'https://peanut-blu.carrd.co/assets/images/card.jpg',
    address: 'Rua Marcos Portugal 18A, 1200-258 Lisboa (enter through Wel Well Cafe)',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.71626, // Nominatim: Wel Well, 18A
    lng: -9.1522307,
    websiteUrl: 'https://peanut-blu.carrd.co/',
    instagramUrl: 'https://www.instagram.com/peanut.blu/',
    openingHours: {
      wed: '14:00-20:30', thu: '14:00-20:30', fri: '14:00-20:30',
      sat: '11:30-16:00', sun: '14:00-20:30',
      note: 'Hours from the October 2026 calendar; workshops and walk-ins inside these hours.',
    },
  },
  {
    id: 'hall-atelier',
    slug: 'hall-atelier',
    name: 'hALL',
    aliases: ['hALL atelier', 'Hall Atelier', 'hallatelier.com'],
    kind: 'both',
    category: 'workshop-space',
    description:
      'Bright ~100 m² creative workspace in central Lisbon with mezzanines and a ceramic kiln. Runs ceramic-painting workshops (mugs, plates, vases and more) and private workshops for birthdays, groups and team-building; the space can also be rented for co-working, shoots, showrooms and events.',
    imageUrl:
      'https://static1.squarespace.com/static/602d342212b33a4973f1f966/t/621ba6b894eb8b659e5ad25d/1613589115086/nomabrand.jpeg?format=1500w',
    address: 'Rua Ferreira Chaves 5A, 1070-177 Lisboa',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.7286388, // street-level (Nominatim had no house number)
    lng: -9.1656587,
    websiteUrl: 'https://hallatelier.com/',
    instagramUrl: 'https://www.instagram.com/hall.atelier/',
    openingHours: { note: 'By appointment only — contact before visiting.' },
  },
  {
    id: 'macs',
    slug: 'macs',
    name: 'MACS',
    aliases: ['MACS Porto', 'MACSPLUS', 'macs_pt'],
    kind: 'both',
    category: 'artist-run',
    description:
      'Artist-run space and cultural association in Porto. Hosts guest-artist workshops (e.g. ceramic hand-building), PechaKucha-style presentation nights for the local art community, and a ceramics coworking studio with Tuesday-evening and Saturday-morning sessions. Events are announced on Instagram and booked via Linktree.',
    imageUrl:
      'https://ugc.production.linktr.ee/190c1bd3-8230-4888-a1a6-126d8b69a473_306797102-5446674295380420-7441361907296559315-n.jpeg',
    address: 'Rua da Boavista 84, 4050-112 Porto',
    city: 'Porto',
    country: 'Portugal',
    lat: 41.1561808, // street-level (Nominatim had no house number)
    lng: -8.6186392,
    websiteUrl: 'https://linktr.ee/macs_pt',
    instagramUrl: 'https://www.instagram.com/macs_pt/',
  },
];
