const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const hero = document.querySelector('.hero');
const heroVideo = document.querySelector('.hero-video');
const heroPlay = document.querySelector('.hero-play');
const heroVideoError = document.querySelector('.hero-video-error');
const heroPlayer = window.Vimeo ? new window.Vimeo.Player(heroVideo) : null;
const heroTitleSwap = document.querySelector('.hero-title-swap');
const aboutDetails = document.querySelector('.about-details');
const aboutSection = document.querySelector('.about-section');
const aboutPhotoFrame = document.querySelector('.about-photo-frame');
const videoCards = document.querySelectorAll('[data-video-card]');
const musicCard = document.querySelector('[data-music-card]');
const musicPlay = musicCard?.querySelector('.music-play');
const musicThumbnail = musicCard?.querySelector('.music-thumbnail');
const musicPlayer = musicCard?.querySelector('.music-player');
const musicTrack = musicCard?.querySelector('.music-track');
const musicAudio = musicCard?.querySelector('.music-audio');

if (heroTitleSwap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const titleWords = ['Jacob', 'Video'];
	let currentTitleWord = 0;

	const flickerTitle = () => {
		heroTitleSwap.classList.add('is-flickering');
		window.setTimeout(() => {
			currentTitleWord = (currentTitleWord + 1) % titleWords.length;
			heroTitleSwap.textContent = titleWords[currentTitleWord];
		}, 180);
		window.setTimeout(() => {
			heroTitleSwap.classList.remove('is-flickering');
			window.setTimeout(flickerTitle, currentTitleWord === 0 ? 3500 : 1600);
		}, 680);
	};

	window.setTimeout(flickerTitle, 3500);
}

function closeMenu() {
	menuToggle.classList.remove('is-open');
	mobileNav.classList.remove('is-open');
	menuToggle.setAttribute('aria-expanded', 'false');
	menuToggle.setAttribute('aria-label', 'Open navigation');
}

menuToggle.addEventListener('click', () => {
	const isOpen = menuToggle.classList.toggle('is-open');
	mobileNav.classList.toggle('is-open', isOpen);
	menuToggle.setAttribute('aria-expanded', String(isOpen));
	menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const muteHeroVideoForWork = () => {
	if (!heroPlayer || !hero.classList.contains('is-audio-on')) return;
	heroPlayer.setMuted(true).then(() => {
		hero.classList.remove('is-audio-on');
	}).catch((error) => {
		console.error('Could not mute hero video before playing selected work.', error);
	});
};

if (heroPlay && heroVideoError) {
	if (heroPlayer) {
		heroPlayer.on('play', () => {
			hero.classList.add('is-video-playing');
			heroPlay.hidden = true;
			heroVideoError.hidden = true;
		});
	}

	heroPlay.addEventListener('click', () => {
		heroVideoError.hidden = true;
		if (!heroPlayer) {
			console.error('Vimeo player API is unavailable; could not play hero video.');
			heroVideoError.hidden = false;
			return;
		}
		heroPlayer.play().then(() => heroPlayer.setMuted(false)).then(() => {
			hero.classList.add('is-audio-on');
		}).catch((error) => {
			console.error('Could not play hero video with sound.', error);
			heroVideoError.hidden = false;
		});
	});
}

videoCards.forEach((card) => {
	const playButton = card.querySelector('.card-play');
	const thumbnail = card.querySelector('.video-thumbnail');
	const player = card.querySelector('.work-video-player');
	const iframe = player.querySelector('iframe');

	playButton.addEventListener('click', () => {
		muteHeroVideoForWork();
		if (!iframe.hasAttribute('src')) iframe.src = `${iframe.dataset.src}&autoplay=1`;
		card.classList.add('is-open');
		thumbnail.hidden = true;
		player.hidden = false;
		playButton.setAttribute('aria-expanded', 'true');
	});
});

if (musicCard && musicPlay && musicThumbnail && musicPlayer && musicTrack && musicAudio) {
	const loadTrack = () => {
		musicAudio.src = musicTrack.value;
		musicAudio.load();
	};

	musicPlay.addEventListener('click', () => {
		musicCard.classList.add('is-open');
		musicThumbnail.hidden = true;
		musicPlayer.hidden = false;
		musicPlay.setAttribute('aria-expanded', 'true');
		loadTrack();
		musicAudio.play().catch(() => {});
	});

	musicTrack.addEventListener('change', () => {
		loadTrack();
		musicAudio.play().catch(() => {});
	});
}

let aboutBioFrame;

const updateAboutBio = () => {
	if (aboutBioFrame) return;
	aboutBioFrame = requestAnimationFrame(() => {
		const sectionHeight = aboutSection.offsetHeight;
		const startScroll = aboutSection.offsetTop - window.innerHeight * 0.55;
		const endScroll = aboutSection.offsetTop + sectionHeight - window.innerHeight * 0.95;
		const progress = Math.max(0, Math.min(1, (window.scrollY - startScroll) / (endScroll - startScroll)));
		const horizontalOffset = (1 - progress) * -80;
		const verticalOffset = (1 - progress) * 30;
		aboutDetails.style.setProperty('--bio-x', `${horizontalOffset}px`);
		aboutDetails.style.setProperty('--bio-y', `${verticalOffset}px`);
		const portraitProgress = Math.max(0, Math.min(1,
			(window.innerHeight * 0.84 - aboutPhotoFrame.getBoundingClientRect().top) / (window.innerHeight * 0.32)
		));
		aboutPhotoFrame.style.setProperty('--portrait-offset', `${(1 - portraitProgress) * 70}px`);
		document.querySelectorAll('.about-word').forEach((word) => {
			const delay = Number(word.style.getPropertyValue('--word-delay')) || 0;
			const wordProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
			const rest = word.querySelector('.about-rest');
			const fullWidth = rest.scrollWidth;
			rest.style.width = `${fullWidth * wordProgress + (wordProgress ? 0.12 * parseFloat(getComputedStyle(word).fontSize) : 0)}px`;
			word.style.setProperty('--word-progress', wordProgress);
		});
		aboutBioFrame = null;
	});
};

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	aboutDetails.style.setProperty('--bio-x', '0px');
	aboutDetails.style.setProperty('--bio-y', '0px');
	aboutPhotoFrame.style.setProperty('--portrait-offset', '0px');
	document.querySelectorAll('.about-word').forEach((word) => word.style.setProperty('--word-progress', '1'));
} else {
	window.addEventListener('scroll', updateAboutBio, { passive: true });
	document.addEventListener('scroll', updateAboutBio, { passive: true });
	window.addEventListener('resize', updateAboutBio);
	updateAboutBio();
}

const aboutMore = document.querySelector('.about-more');
const aboutPopout = document.querySelector('.about-popout');

if (aboutMore && aboutPopout) {
	aboutMore.addEventListener('click', (event) => {
		event.stopPropagation();
		aboutPopout.hidden = false;
		aboutMore.setAttribute('aria-expanded', 'true');
		aboutPopout.classList.add('is-open');
	});

	const closeAboutPopout = () => {
		aboutPopout.hidden = true;
		aboutMore.setAttribute('aria-expanded', 'false');
		aboutPopout.classList.remove('is-open');
	};

	document.addEventListener('click', closeAboutPopout);
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') closeAboutPopout();
	});
}
