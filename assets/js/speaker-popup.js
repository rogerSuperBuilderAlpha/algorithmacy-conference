// Speaker popup modal functionality

const speakerData = {
  'roger-hunt': {
    name: 'Roger Hunt',
    title: 'AI engineer and convenor, Global Algorithmacy Conference',
    bio: 'Roger Hunt is a PhD candidate in Organisational Theory at Bentley University and an AI engineer specialising in Application Layer Communication. He leads Ludwitt Academy and convenes the Global Algorithmacy Conference.',
    photo: '/images/speakers/roger-hunt.jpg',
    linkedin: 'https://www.linkedin.com/in/rogerjgs404040/'
  },
  'antonio-mele': {
    name: 'Antonio Mele',
    title: 'Associate Professor of Economics, LSE',
    bio: 'Antonio Mele is Associate Professor of Economics at LSE. He specialises in macroeconomics, monetary economics and computational methods. His research explores financial markets, monetary policy, decision-making and AI.',
    photo: '/images/speakers/antonio-mele.jpg',
    linkedin: 'https://www.linkedin.com/in/antonio-mele-6387821/'
  },
  'antonio-scala': {
    name: 'Antonio Scala',
    title: 'Research Director, CNR and Professor, Sapienza University of Rome',
    bio: 'Antonio Scala is Research Director at Italy\'s CNR and Professor at Sapienza University of Rome. His research applies network science to systemic risk, infrastructure, misinformation and network medicine.',
    photo: '/images/speakers/antonio-scala.jpg',
    linkedin: 'https://www.linkedin.com/in/antonio-scala-1b298b19'
  },
  'samuel-fosso-wamba': {
    name: 'Samuel Fosso Wamba',
    title: 'Professor and Associate Dean for Research, TBS Education',
    bio: 'Samuel Wamba is Professor and Associate Dean for Research at TBS Education, specialising in AI, digital transformation and sovereignty. He is an award-winning researcher in AI governance and organisational change.',
    photo: '/images/speakers/samuel-fosso-wamba.jpg',
    linkedin: 'https://www.linkedin.com/in/samuelfossowamba'
  },
  'amanda-mcewen': {
    name: 'Amanda McEwen',
    title: 'SVP of Clinical Development, Salubris Biotherapeutics',
    bio: 'Amanda McEwen is SVP of Clinical Development at Salubris Biotherapeutics and an Executive Fellow at Harvard Business School, bringing more than 16 years of biotechnology leadership in therapy, regulatory strategy and life-science education.',
    photo: '/images/speakers/amanda-mcewen.jpg',
    linkedin: 'https://www.linkedin.com/in/amandamariegentilemcewen'
  },
  'chevonnese-chevers-whyte': {
    name: 'Chevonnese Chevers Whyte',
    title: 'Animation educator and industry professional',
    bio: 'Chevonnese Chevers Whyte is an animation educator, entrepreneur and industry professional at UWI Mona. As President of the Jamaica Animation Nation Network, she champions practical, industry-driven education.',
    photo: '/images/speakers/chevonnese-chevers-whyte.jpg',
    linkedin: 'https://www.linkedin.com/in/chevonnese-chevers-whyte/'
  },
  'uohna-thiessen': {
    name: 'Dr. Uohna Thiessen',
    title: 'AI/ML strategist, educator and data scientist',
    bio: 'Dr Uohna Thiessen brings deep expertise in AI literacy and responsible adoption. At the inaugural Algorithmacy Conference, she will explore AI education, workforce readiness and making AI accessible for future generations.',
    photo: '/images/speakers/uohna-thiessen.jpg',
    linkedin: 'https://www.linkedin.com/in/druohna-datascientist/'
  },
  'mistancia-kanengoni': {
    name: 'Mistancia Kanengoni',
    title: 'Environmental anthropologist and researcher',
    bio: 'Mistancia Kanengoni is an environmental anthropologist and UCT PhD graduate whose interdisciplinary research explores environmental governance, sustainability, ecological relationships, processes and justice across Africa.',
    photo: '/images/speakers/mistancia-kanengoni.png',
    linkedin: 'https://www.linkedin.com/in/mystecia-kanengoni-4a710086/'
  },
  'ryan-roper': {
    name: 'Ryan R. Roper',
    title: 'Engineer, energy-transition leader and CEO of CEAL Green Energy Limited',
    bio: 'Ryan R. Roper is advancing resilient infrastructure, clean energy and technology-enabled delivery. Drawing on over two decades of experience leading complex capital projects, Ryan brings together engineering discipline, business transformation and a commitment to Caribbean capability.',
    photo: '/images/speakers/ryan-roper.jpg',
    linkedin: 'https://www.linkedin.com/in/ryanroper1/'
  },
  'sarah-witmer': {
    name: 'Sarah Witmer',
    title: 'Digital cultures researcher and media professor',
    bio: 'Sarah Witmer is a digital cultures researcher, media professor and PhD candidate whose work explores digital media, algorithmic authority, online communities, journalism, identity and institutional trust.',
    photo: '/images/speakers/sarah-witmer.jpg',
    linkedin: 'https://www.linkedin.com/in/sarahwitmer/'
  },
  'mellissa-lezama': {
    name: 'Mellissa Lezama',
    title: 'Founder and CEO of The HR Horizon',
    bio: 'Mellissa Lezama, Founder and CEO of The HR Horizon, is an attorney and global HR specialist helping organisations navigate people, technology, employment law and AI-driven workplace change responsibly.',
    photo: '/images/speakers/mellissa-lezama.png',
    linkedin: 'https://www.linkedin.com/in/mellissa-lezama'
  }
};

const modal = document.getElementById('speaker-modal');
const modalPanel = modal.querySelector('.speaker-modal__panel');
const modalPhoto = document.getElementById('modal-photo');
const modalName = document.getElementById('modal-name');
const modalTitle = document.getElementById('modal-title');
const modalBio = document.getElementById('modal-bio');
const modalLinkedin = document.getElementById('modal-linkedin');

let lastFocusedElement = null;
const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Open modal
function openSpeakerModal(speakerId) {
  const speaker = speakerData[speakerId];
  if (!speaker) return;

  // Populate modal
  modalPhoto.src = speaker.photo;
  modalPhoto.alt = speaker.name;
  modalName.textContent = speaker.name;
  modalTitle.textContent = speaker.title;
  modalBio.textContent = speaker.bio;
  modalLinkedin.href = speaker.linkedin;

  // Show modal
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  modalPanel.removeAttribute('inert');
  document.body.classList.add('speaker-modal-open');

  // Store last focused element
  lastFocusedElement = document.activeElement;

  // Focus first focusable element in modal
  setTimeout(() => {
    const firstFocusable = modal.querySelector(focusableSelectors);
    if (firstFocusable) firstFocusable.focus();
  }, 100);
}

// Close modal
function closeSpeakerModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  modalPanel.setAttribute('inert', '');
  document.body.classList.remove('speaker-modal-open');

  // Restore focus
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

// Trap focus inside modal
function trapFocus(e) {
  if (!modal.classList.contains('is-open')) return;

  const focusableElements = modal.querySelectorAll(focusableSelectors);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Speaker card click handlers
  const speakerCards = document.querySelectorAll('[data-speaker-id]');
  speakerCards.forEach(card => {
    const speakerId = card.getAttribute('data-speaker-id');
    
    // Click handler
    card.addEventListener('click', () => {
      openSpeakerModal(speakerId);
    });

    // Keyboard handler
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSpeakerModal(speakerId);
      }
    });
  });

  // Close modal handlers
  const closeButtons = modal.querySelectorAll('[data-close-modal]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeSpeakerModal);
  });

  // Esc key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeSpeakerModal();
    }
    trapFocus(e);
  });
});
