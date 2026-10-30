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
  'chevonnese-chevers-whyte': {
    name: 'Chevonnese Chevers Whyte',
    title: 'Animation educator and industry professional',
    bio: 'Chevonnese Chevers Whyte is an animation educator, entrepreneur and industry professional at UWI Mona. As President of the Jamaica Animation Nation Network, she champions practical, industry-driven education.',
    photo: '/images/speakers/chevonnese-chevers-whyte.jpg',
    linkedin: 'https://www.linkedin.com/in/chevonnese-chevers-whyte/'
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
    bio: 'HR and employment law specialist with 25+ years across the Caribbean, US and UK, helping organisations navigate people, ethical AI adoption and the future of work. Founder & CEO, The HR Horizon.',
    photo: '/images/speakers/mellissa-lezama.jpg',
    linkedin: 'https://www.linkedin.com/in/mellissa-lezama'
  },
  'analise-kandasammy': {
    name: 'Analise Kandasammy',
    title: 'Critical Research, AI and Animation',
    bio: 'Analise Kandasammy is a human-centred futurist, risk strategist and author of Human, Still, helping people protect focus, judgment and clarity while navigating change in an AI-shaped world.',
    photo: '/images/analise-kandasammy.jpg',
    linkedin: 'https://www.linkedin.com/in/analisekandasammy'
  },
  'christopher-din-chong': {
    name: 'Christopher Din Chong',
    title: 'Critical Research, AI and Animation',
    bio: 'Christopher Din Chong is a Trinidad and Tobago filmmaker, AI Solutions Developer and youth advocate, combining storytelling, emerging technology and mentorship to advance creativity, entrepreneurship and social impact.',
    photo: '/images/christopher-din-chong.jpg',
    linkedin: 'https://www.linkedin.com/in/christopher-din-chong'
  },
  'kevin-fleary': {
    name: 'Dr. Kevin Fleary',
    title: 'Learning and Agency in an Algorithmic World',
    bio: 'Dr. Kevin Fleary is a management scientist, UWI lecturer and business transformation specialist, advancing AI-enabled learning, entrepreneurial capabilities and Caribbean enterprise competitiveness through research, innovation and strategic partnerships.',
    photo: '/images/kevin-fleary.jpg',
    linkedin: 'https://www.linkedin.com/in/kevin-fleary-5bb122a1/'
  },
  'eric-elder': {
    name: 'Eric T. Elder',
    title: 'Critical Research, AI and Animation',
    bio: 'Eric T. Elder is an animation, gaming and XR veteran with over 30 years\' experience, known for work on The Simpsons and leading game development education initiatives in Los Angeles.',
    photo: '/images/eric-elder.jpg',
    linkedin: 'https://www.linkedin.com/in/erictelder/'
  },
  'jason-arthur': {
    name: 'Jason Arthur',
    title: 'Building Organisations for the AI Era',
    bio: 'Jason Arthur is a Tobago entrepreneur and AI consultant who builds practical business systems, automates operations and helps business owners use AI to improve productivity while retaining control.',
    photo: '/images/jason-arthur.jpg',
    linkedin: 'https://www.linkedin.com/in/jasonarthurconsulting/'
  },
  'steve-witmer': {
    name: 'Steve Witmer',
    title: 'Building Organisations for the AI Era',
    bio: 'Steve Witmer is a product designer, design technologist and entrepreneur building AI-native software for film production and agriculture, with a focus on intelligent interfaces, agentic systems and human-AI interaction.',
    photo: '/images/steve-witmer.jpg',
    linkedin: 'https://www.linkedin.com/in/stephenwitmer'
  },
  'anisa-oliviel': {
    name: 'Anisa Oliviel',
    title: 'FutureTT: A Developmental Pathway',
    bio: 'Anisa Oliviel is an Executive Director of CEI, Director of The Rose Foundation and peace ambassador, bringing nearly two decades of voluntary-sector experience to youth development, education and equity.',
    photo: '/images/anisa-oliviel.jpg',
    linkedin: 'https://www.linkedin.com/in/anisa-oliviel-385638244/'
  },
  'marcia-belgrove-panelist': {
    name: 'Dr Marcia Belgrove',
    title: 'FutureTT: A Developmental Pathway',
    bio: 'Dr. Marcia Mc Clashie Belgrove is Co-founder of The Rose Foundation and CEI, a community development and social justice advocate, and former adviser to two Trinidad and Tobago Prime Ministers.',
    photo: '/images/marcia-belgrove.jpg',
    linkedin: 'https://www.linkedin.com/in/marcia-belgrove-305596242/'
  },
  'brendon-butts': {
    name: 'Brendon Butts',
    title: 'Chairman, T&T National Commission for UNESCO',
    bio: 'Brendon Butts is an educator, education architect and technology-in-education specialist with more than three decades of experience in teaching, school leadership, professional development and education innovation. He currently serves as Chairman of the Trinidad and Tobago National Commission for UNESCO and as Interim Director of Schools at EDFAM Schools. He is also Founder and Managing Director of Education Solution Specialists Ltd, where he leads the design and implementation of education technology, STEAM, coding, digital literacy and teacher-capacity initiatives across Trinidad and Tobago and the wider Caribbean. Brendon holds a Master\'s degree in Educational Studies from the University of Sheffield, specializing in Educational Technology. His current work explores human-centred AI, computational thinking, learner agency and teacher capacity, and includes the development of a Primary Computational Thinking Framework, designed specifically for the Caribbean primary curriculum.',
    photo: '/images/brendon-butts.jpg',
    linkedin: 'https://www.linkedin.com/in/brendon-butts-9202a415b/'
  },
  'rushton-paray': {
    name: 'Rushton Paray',
    title: 'Founder & MD, CTSL (FutureTT)',
    bio: 'Rushton Paray is the Founder and Managing Director of Computer Technologies & Services Limited (CTSL), with more than 30 years of experience in ICT, entrepreneurship and business leadership. He served as Member of Parliament for Mayaro from 2015 to 2025 and previously led the Mayaro Business Chamber. His work spans digital transformation, technology solutions and community development. He currently serves as Regional Director of the SMRP Trinidad Chapter, bringing a practical business and technology perspective to operational improvement and professional development.',
    photo: '/images/rushton-paray.jpg',
    linkedin: 'https://www.linkedin.com/in/paraygroup'
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
  
  // Handle LinkedIn link - show only if available
  if (speaker.linkedin) {
    modalLinkedin.href = speaker.linkedin;
    modalLinkedin.style.display = 'inline-flex';
  } else {
    modalLinkedin.style.display = 'none';
  }

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
