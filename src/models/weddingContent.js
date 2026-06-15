export const weddingContent = {
  couple: {
    bride: {
      name: "Dewmini Rodrigo",
      role: "The Bride",
      family: "Daughter of Mr and Mrs. Rodrigo",
      image: "assets/img/bride.jpeg",
      badgeIcon: "assets/img/icons/crownqueen.png",
      portraitAlt: "Bride portrait",
    },
    groom: {
      name: "Shalom Grero",
      role: "The Groom",
      family: "Son of Mr and Mrs. Grero",
      image: "assets/img/groom.jpeg",
      badgeIcon: "assets/img/icons/crownking.png",
      portraitAlt: "Groom portrait",
    },
  },

  hero: {
    title: "Shalom & Dewmini",
    eventDay: "Thursday",
    eventDate: "December 10, 2026",
    video: "assets/video/bannervid.mp4",
    notificationIcon: "assets/img/icons/notification.png",
  },

  countdown: {
    targetIso: "2026-12-10T00:00:00+05:30",
    title: "Counting Down to Forever",
    tagline: "♡ Our special day is almost here ♡",
  },

  seatFinder: {
    icon: "assets/img/icons/foodblack.png",
    searchIcon: "assets/img/icons/search.svg",
    title: "Find Your Seat",
    text: "We've saved a special spot just for you. Enter your name on the invitation",
  },

  coupleSection: {
    title: "The Happy Couple",
    description:
      "Two hearts, one love story. Meet the bride and groom who are about to begin their forever journey.",
    noteTitle: "A Note from the Couple",
    note: "“Our journey together begins with a promise, and it would mean so much for us to have you there to witness it. We invite you to celebrate love, togetherness, and new beginnings as we unite in marriage. Sharing this moment with you would be an honor and if you need any information or help, we’re just a call or message away.”",
  },

  weddingDetails: {
    title: "Wedding Details",
    description:
      "All the important information you need to celebrate our special day with us.",
    events: [
      {
        title: "Church Ceremony",
        iconType: "image",
        icon: "assets/img/icons/wedrings.png",
        iconAlt: "Wedding rings icon",
        iconClassName: "weddingCard__iconImg weddingCard__iconImg--rings",
        lines: [
          { text: "10th December, 2026", className: "wLine wLine--strong" },
          { text: "15:30 PM onwards", className: "wLine" },
          {
            text: "Katunayake Methodist Church",
            className: "wLine wLine--light",
          },
        ],
        note: "If you need any further information, please don’t hesitate to reach out to us",
        mapUrl: "https://maps.app.goo.gl/bDSPTL4FdWmHWo5b6",
      },
      {
        title: "Reception",
        iconType: "sparkle",
        lines: [
          { text: "10th December, 2026", className: "wLine wLine--strong" },
          { text: "18:30 PM onwards", className: "wLine" },
          { text: "Ramrich Hotel, Ja -Ela", className: "wLine wLine--light" },
          { text: "Melody Ballroom", className: "wLine wLine--muted" },
        ],
        mapUrl: "https://maps.app.goo.gl/UnUTYUmcdX7yG3z97",
      },
    ],
  },

  timeline: {
    title: "Wedding Day Timeline",
    items: [
      {
        side: "left",
        time: "15.15 PM",
        text: "Groom enters the Church location",
        icon: "assets/img/icons/church.png",
        iconAlt: "Church icon",
        iconLabel: "Church",
      },
      {
        side: "right",
        time: "15.30 PM",
        text: "Bride enters the Church location",
        icon: "assets/img/icons/church.png",
        iconAlt: "Church icon",
        iconLabel: "Church",
      },
      {
        side: "left",
        time: "15.30 PM",
        text: "Church ceremony",
        icon: "assets/img/icons/book.png",
        iconAlt: "Bible icon",
        iconLabel: "Bible",
      },
      {
        side: "right",
        time: "18.30 PM",
        text: "Couple enters the hall",
        icon: "assets/img/icons/gem.png",
        iconAlt: "Diamond icon",
        iconLabel: "Diamond",
      },
      {
        side: "left",
        time: "19.30 PM",
        text: "Dinner",
        icon: "assets/img/icons/food.png",
        iconAlt: "Dinner icon",
        iconLabel: "Dinner",
      },
      {
        side: "right",
        time: "21.00 PM",
        text: "First Dance & Dance Floor Opens",
        icon: "assets/img/icons/musicnote.png",
        iconAlt: "Music icon",
        iconLabel: "Music",
      },
      {
        side: "left",
        time: "11.00 PM",
        text: "Departure",
        icon: "assets/img/icons/justmarried.png",
        iconAlt: "Departure icon",
        iconLabel: "Departure",
      },
    ],
  },

  rsvp: {
    title: "RSVP",
    description:
      "We can't wait to celebrate with you! Please let us know if you'll be joining us on our special day.",
    photo: "assets/img/bride.jpeg",
    formAction:
      "https://script.google.com/macros/s/AKfycbyDZ8T3Qru7FGbVZOLm8TE4Eb47nD7p8YzHvfROR2Er40cwbC9B_Fhthbimj8eDdUB2cw/exec",
  },

  words: {
    title: "Words of Love",
    description:
      "Hear what our family and friends have to say about our love story.",
  },

  gallery: {
    title: "Moments Before Forever",
    description:
      "Captured memories of the smiles, dreams, and magic leading up to our big day.",
    photos: Array.from({ length: 8 }, (_, index) => {
      const number = String(index + 1).padStart(2, "0");
      return {
        src: `assets/img/gallery/${number}.svg`,
        alt: `Couple photo ${index + 1}`,
      };
    }),
  },

  finalCta: {
    title: "We Can't Wait to Celebrate",
    titleBreak: "with You!",
    description:
      "Thank you for being part of our love story. Your presence will make our wedding day absolutely perfect.",
  },

  footer: {
    logoIcon: "assets/img/icons/wedrings.png",
    logoText: "S & D",
    description:
      "Thank you for visiting our wedding website and being part of our love story. We can't wait to celebrate with you!",
    details: ["10th December 2026", "Ramrich Hotel, Ja Ela", "Melody Ballroom"],
    contacts: [
      { name: "Shalom", label: "Shalom - 076 452 5012", phone: "+94764525012" },
      {
        name: "Dewmini",
        label: "Dewmini - 077 328 4579",
        phone: "+94773284579",
      },
    ],
  },

  sheets: {
    googleSheetId: "1_D3_kgP8MUqUyuPEvJ7gVwwCwRT7oSMqu3vA_06DZJM",
    rsvpTabName: "RSVP Responses",
    seatingTabName: "Seating Order",
  },
};
