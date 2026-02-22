// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('navbar__menu--open');
    navToggle.classList.toggle('navbar__toggle--active');
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('navbar__menu--open');
      navToggle.classList.remove('navbar__toggle--active');
    });
  });
}

// Navbar background on scroll
const navbar = document.getElementById('navbar');

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
  }, { passive: true });
}

// Scroll-triggered fade-in animations
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate--visible');
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  scrollObserver.observe(el);
});

// Reels section: play all videos when section is visible, pause when not
const reelsSection = document.getElementById('reels');
if (reelsSection) {
  const reelVideos = reelsSection.querySelectorAll('.reels-marquee__item video');

  function playReelVideo(video) {
    if (video.preload === 'none') {
      video.preload = 'auto';
      video.load();
    }
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.addEventListener('canplay', function onCanPlay() {
          video.removeEventListener('canplay', onCanPlay);
          video.play().catch(() => {});
        });
      });
    }
  }

  const reelsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        reelVideos.forEach(v => playReelVideo(v));
      } else {
        reelVideos.forEach(v => v.pause());
      }
    });
  }, { threshold: 0.05 });

  reelsObserver.observe(reelsSection);
}

// Video Work card: autoplay when in view (mobile-safe)
const videoWorkCard = document.getElementById('videoWorkCard');
if (videoWorkCard) {
  const previewVideo = videoWorkCard.querySelector('video');
  if (previewVideo) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const playPromise = previewVideo.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              previewVideo.addEventListener('canplay', function onCanPlay() {
                previewVideo.removeEventListener('canplay', onCanPlay);
                previewVideo.play().catch(() => {});
              });
              function onInteraction() {
                previewVideo.play().catch(() => {});
                document.removeEventListener('touchstart', onInteraction);
                document.removeEventListener('click', onInteraction);
              }
              document.addEventListener('touchstart', onInteraction, { once: true, passive: true });
              document.addEventListener('click', onInteraction, { once: true });
            });
          }
        } else {
          previewVideo.pause();
        }
      });
    }, { threshold: 0.1 });
    cardObserver.observe(videoWorkCard);
  }
}

// Video Work Lightbox
const videoLightbox = document.getElementById('videoLightbox');
if (videoLightbox && videoWorkCard) {
  const videoSources = [
    { src: 'images/reels/DI10aTBRffO.mp4', poster: 'images/reels/DI10aTBRffO-poster.jpg' },
    { src: 'images/reels/C5n7zbHO5E0.mp4', poster: 'images/reels/C5n7zbHO5E0-poster.jpg' },
    { src: 'images/reels/DFLBhmzRUrN.mp4', poster: 'images/reels/DFLBhmzRUrN-poster.jpg' },
    { src: 'images/reels/DDFwYgAxy8d.mp4', poster: 'images/reels/DDFwYgAxy8d-poster.jpg' },
    { src: 'images/reels/DByv66mxq_a.mp4', poster: 'images/reels/DByv66mxq_a-poster.jpg' },
    { src: 'images/reels/C_Qp8jvu4cL.mp4', poster: 'images/reels/C_Qp8jvu4cL-poster.jpg' },
    { src: 'images/reels/DTifcOsjjCz.mp4', poster: 'images/reels/DTifcOsjjCz-poster.jpg' }
  ];
  const player = document.getElementById('videoLightboxPlayer');
  const counter = document.getElementById('videoLightboxCounter');
  let currentVideoIndex = 0;

  function showVideo() {
    var video = videoSources[currentVideoIndex];
    player.poster = video.poster;
    player.src = video.src;
    player.load();
    player.oncanplay = function () {
      player.oncanplay = null;
      player.play().catch(() => {});
    };
    counter.textContent = (currentVideoIndex + 1) + ' / ' + videoSources.length;
  }

  function openVideoLightbox() {
    currentVideoIndex = 0;
    videoLightbox.classList.add('video-lightbox--open');
    document.body.style.overflow = 'hidden';
    showVideo();
  }

  function closeVideoLightbox() {
    videoLightbox.classList.remove('video-lightbox--open');
    document.body.style.overflow = '';
    player.pause();
    player.removeAttribute('src');
  }

  function nextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
    showVideo();
  }

  function prevVideo() {
    currentVideoIndex = (currentVideoIndex - 1 + videoSources.length) % videoSources.length;
    showVideo();
  }

  videoWorkCard.addEventListener('click', openVideoLightbox);
  videoLightbox.querySelector('.video-lightbox__close').addEventListener('click', closeVideoLightbox);
  videoLightbox.querySelector('.video-lightbox__next').addEventListener('click', nextVideo);
  videoLightbox.querySelector('.video-lightbox__prev').addEventListener('click', prevVideo);
  videoLightbox.addEventListener('click', (e) => {
    if (e.target === videoLightbox) closeVideoLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!videoLightbox.classList.contains('video-lightbox--open')) return;
    if (e.key === 'Escape') closeVideoLightbox();
    if (e.key === 'ArrowRight') nextVideo();
    if (e.key === 'ArrowLeft') prevVideo();
  });

  // Touch/swipe navigation
  let videoTouchStartX = 0;
  videoLightbox.addEventListener('touchstart', (e) => {
    videoTouchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  videoLightbox.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - videoTouchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) nextVideo();
      else prevVideo();
    }
  }, { passive: true });
}

// Gallery data
const galleries = {
  basketball: [
    'images/basketball/2024-12-19_17-37-12_UTC_1.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_2.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_3.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_4.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_5.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_6.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_7.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_8.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_9.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_10.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_11.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_12.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_13.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_14.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_15.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_16.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_17.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_18.jpg',
    'images/basketball/2024-12-19_17-37-12_UTC_19.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_1.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_2.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_3.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_4.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_5.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_6.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_7.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_8.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_9.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_10.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_11.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_12.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_13.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_14.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_15.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_16.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_17.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_18.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_19.jpg',
    'images/basketball/2025-01-08_22-55-37_UTC_20.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_1.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_2.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_3.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_4.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_5.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_6.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_7.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_8.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_9.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_10.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_11.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_12.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_13.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_14.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_15.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_16.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_17.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_18.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_19.jpg',
    'images/basketball/2025-01-19_16-22-23_UTC_20.jpg',
    'images/basketball/2025-01-26_00-05-14_UTC_1.jpg',
    'images/basketball/2025-01-26_00-05-14_UTC_2.jpg',
    'images/basketball/2025-01-26_00-05-14_UTC_3.jpg',
    'images/basketball/2025-01-26_00-05-14_UTC_4.jpg',
    'images/basketball/2025-01-26_00-05-14_UTC_5.jpg',
    'images/basketball/2025-01-26_00-05-14_UTC_6.jpg',
    'images/basketball/2025-01-26_00-05-14_UTC_7.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_1.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_2.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_3.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_4.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_5.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_6.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_7.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_8.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_9.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_10.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_11.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_12.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_13.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_14.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_15.jpg',
    'images/basketball/2025-01-26_00-20-44_UTC_16.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_1.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_2.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_3.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_4.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_5.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_6.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_7.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_8.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_9.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_10.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_11.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_12.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_13.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_14.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_15.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_16.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_17.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_18.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_19.jpg',
    'images/basketball/2025-02-12_04-23-56_UTC_20.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_1.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_2.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_3.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_4.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_5.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_6.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_7.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_8.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_9.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_10.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_11.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_12.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_13.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_14.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_15.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_16.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_17.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_18.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_19.jpg',
    'images/basketball/2025-03-05_16-00-03_UTC_20.jpg'
  ],
  fnl: [
    'images/fnl/DO_OeiPDQQl_1.jpg',
    'images/fnl/DO_OeiPDQQl_2.jpg',
    'images/fnl/DO_OeiPDQQl_3.jpg',
    'images/fnl/DO_OeiPDQQl_4.jpg',
    'images/fnl/DO_OeiPDQQl_5.jpg',
    'images/fnl/DO_OeiPDQQl_6.jpg',
    'images/fnl/DO_OeiPDQQl_7.jpg',
    'images/fnl/DO_OeiPDQQl_8.jpg',
    'images/fnl/DO_OeiPDQQl_9.jpg',
    'images/fnl/C-t3ZmvtAWC_1.jpg',
    'images/fnl/C-t3ZmvtAWC_2.jpg',
    'images/fnl/C-t3ZmvtAWC_3.jpg',
    'images/fnl/C-t3ZmvtAWC_4.jpg',
    'images/fnl/C-t3ZmvtAWC_5.jpg',
    'images/fnl/C-t3ZmvtAWC_6.jpg',
    'images/fnl/C-t3ZmvtAWC_7.jpg',
    'images/fnl/C-t3ZmvtAWC_8.jpg',
    'images/fnl/C-t3ZmvtAWC_9.jpg',
    'images/fnl/CyqhP_wuBDQ_1.jpg',
    'images/fnl/CyqhP_wuBDQ_2.jpg',
    'images/fnl/CyqhP_wuBDQ_3.jpg',
    'images/fnl/CyqhP_wuBDQ_4.jpg',
    'images/fnl/CyqhP_wuBDQ_5.jpg',
    'images/fnl/CyqhP_wuBDQ_6.jpg',
    'images/fnl/CyqhP_wuBDQ_7.jpg',
    'images/fnl/CyqhP_wuBDQ_8.jpg',
    'images/fnl/CyqhP_wuBDQ_9.jpg'
  ],
  orangewhite: [
    'images/selected/2025-04-13_01-22-24_UTC_1.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_2.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_3.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_4.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_5.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_6.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_7.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_8.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_9.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_10.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_11.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_12.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_13.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_14.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_15.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_16.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_17.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_18.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_19.jpg',
    'images/selected/2025-04-13_01-22-24_UTC_20.jpg'
  ],
  football: [
    'images/football/2024-09-01_01-29-33_UTC_1.jpg',
    'images/football/2024-09-01_01-29-33_UTC_2.jpg',
    'images/football/2024-09-01_01-29-33_UTC_3.jpg',
    'images/football/2024-09-01_01-29-33_UTC_4.jpg',
    'images/football/2024-09-01_01-29-33_UTC_5.jpg',
    'images/football/2024-09-01_01-29-33_UTC_6.jpg',
    'images/football/2024-09-01_01-29-33_UTC_7.jpg',
    'images/football/2024-09-01_01-29-33_UTC_8.jpg',
    'images/football/2024-09-01_01-29-33_UTC_9.jpg',
    'images/football/2024-09-01_01-29-33_UTC_10.jpg',
    'images/football/2024-09-15_14-43-13_UTC_1.jpg',
    'images/football/2024-09-15_14-43-13_UTC_2.jpg',
    'images/football/2024-09-15_14-43-13_UTC_3.jpg',
    'images/football/2024-09-15_14-43-13_UTC_4.jpg',
    'images/football/2024-09-15_14-43-13_UTC_5.jpg',
    'images/football/2024-09-15_14-43-13_UTC_6.jpg',
    'images/football/2024-09-15_14-43-13_UTC_7.jpg',
    'images/football/2024-09-15_14-43-13_UTC_8.jpg',
    'images/football/2024-09-15_14-43-13_UTC_9.jpg',
    'images/football/2024-09-15_14-43-13_UTC_10.jpg',
    'images/football/2024-09-15_14-43-13_UTC_11.jpg',
    'images/football/2024-09-15_14-43-13_UTC_12.jpg',
    'images/football/2024-09-15_14-43-13_UTC_13.jpg',
    'images/football/2024-09-15_14-43-13_UTC_14.jpg',
    'images/football/2024-09-15_14-43-13_UTC_15.jpg',
    'images/football/2024-09-15_14-43-13_UTC_16.jpg',
    'images/football/2024-09-15_14-43-13_UTC_17.jpg',
    'images/football/2024-09-15_14-43-13_UTC_18.jpg',
    'images/football/2024-09-15_14-43-13_UTC_19.jpg',
    'images/football/2024-09-15_14-43-13_UTC_20.jpg',
    'images/football/2024-09-16_18-57-19_UTC_1.jpg',
    'images/football/2024-09-16_18-57-19_UTC_2.jpg',
    'images/football/2024-09-16_18-57-19_UTC_3.jpg',
    'images/football/2024-09-16_18-57-19_UTC_4.jpg',
    'images/football/2024-09-16_18-57-19_UTC_5.jpg',
    'images/football/2024-09-16_18-57-19_UTC_6.jpg',
    'images/football/2024-09-16_18-57-19_UTC_7.jpg',
    'images/football/2024-09-16_18-57-19_UTC_8.jpg',
    'images/football/2024-09-16_18-57-19_UTC_9.jpg',
    'images/football/2024-09-16_18-57-19_UTC_10.jpg',
    'images/football/2025-01-08_03-34-38_UTC_1.jpg',
    'images/football/2025-01-08_03-34-38_UTC_2.jpg',
    'images/football/2025-01-08_03-34-38_UTC_3.jpg',
    'images/football/2025-01-08_03-34-38_UTC_4.jpg',
    'images/football/2025-01-08_03-34-38_UTC_5.jpg',
    'images/football/2025-01-08_03-34-38_UTC_6.jpg',
    'images/football/2025-01-08_03-34-38_UTC_7.jpg'
  ],
  creative: [
    'images/posts/2025-08-05_15-20-45_UTC_5.jpg',
    'images/update2/2024-06-08_23-49-02_3.jpg',
    'images/posts/2024-07-02_04-56-48_UTC_7.jpg',
    'images/posts/2023-11-11_04-17-16_UTC_2.jpg',
    'images/posts/2024-11-25_23-13-12_UTC_4.jpg',
    'images/update2/2024-06-08_23-49-02_8.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_11.jpg',
    'images/posts/2024-07-02_04-56-48_UTC_1.jpg',
    'images/posts/2023-11-11_04-17-16_UTC_6.jpg',
    'images/update2/2024-06-08_23-49-02_1.jpg',
    'images/posts/2024-11-25_23-13-12_UTC_7.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_2.jpg',
    'images/posts/2024-07-02_04-56-48_UTC_9.jpg',
    'images/update2/2024-06-08_23-49-02_6.jpg',
    'images/posts/2023-11-11_04-17-16_UTC_4.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_14.jpg',
    'images/posts/2024-11-25_23-13-12_UTC_1.jpg',
    'images/update2/2024-06-08_23-49-02_10.jpg',
    'images/posts/2024-07-02_04-56-48_UTC_3.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_8.jpg',
    'images/posts/2023-11-11_04-17-16_UTC_9.jpg',
    'images/posts/2024-11-25_23-13-12_UTC_5.jpg',
    'images/update2/2024-06-08_23-49-02_4.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_1.jpg',
    'images/posts/2024-07-02_04-56-48_UTC_6.jpg',
    'images/posts/2023-11-11_04-17-16_UTC_1.jpg',
    'images/update2/2024-06-08_23-49-02_9.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_12.jpg',
    'images/posts/2024-11-25_23-13-12_UTC_3.jpg',
    'images/posts/2024-07-02_04-56-48_UTC_10.jpg',
    'images/update2/2024-06-08_23-49-02_2.jpg',
    'images/posts/2023-11-11_04-17-16_UTC_7.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_6.jpg',
    'images/posts/2024-11-25_23-13-12_UTC_2.jpg',
    'images/posts/2024-07-02_04-56-48_UTC_4.jpg',
    'images/update2/2024-06-08_23-49-02_5.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_9.jpg',
    'images/posts/2023-11-11_04-17-16_UTC_3.jpg',
    'images/posts/2024-07-02_04-56-48_UTC_8.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_3.jpg',
    'images/posts/2024-11-25_23-13-12_UTC_6.jpg',
    'images/update2/2024-06-08_23-49-02_7.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_10.jpg',
    'images/posts/2023-11-11_04-17-16_UTC_8.jpg',
    'images/posts/2024-07-02_04-56-48_UTC_2.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_4.jpg',
    'images/posts/2023-11-11_04-17-16_UTC_5.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_13.jpg',
    'images/posts/2024-07-02_04-56-48_UTC_5.jpg',
    'images/posts/2025-08-05_15-20-45_UTC_7.jpg'
  ]
};

// Lightbox gallery
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');

if (lightbox) {
  let currentGallery = [];
  let currentIndex = 0;

  function openLightbox(galleryName) {
    if (!galleries[galleryName] || galleries[galleryName].length === 0) return;
    currentGallery = galleries[galleryName];
    currentIndex = 0;
    showImage();
    lightbox.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('lightbox--open');
    document.body.style.overflow = '';
  }

  function showImage() {
    lightboxImg.src = currentGallery[currentIndex];
    lightboxCounter.textContent = (currentIndex + 1) + ' / ' + currentGallery.length;
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    showImage();
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    showImage();
  }

  // Click handlers
  lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox__next').addEventListener('click', nextImage);
  lightbox.querySelector('.lightbox__prev').addEventListener('click', prevImage);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('lightbox--open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

  // Touch/swipe navigation
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) nextImage();
      else prevImage();
    }
  }, { passive: true });

  // Contact form validation
  var contactForm = document.querySelector('.contact__form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var email = contactForm.querySelector('input[name="email"]');
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailPattern.test(email.value.trim())) {
        e.preventDefault();
        email.focus();
        return;
      }
      var honey = contactForm.querySelector('input[name="_honey"]');
      if (honey && honey.value) {
        e.preventDefault();
        return;
      }
      // Prevent double-submission
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
    });
  }

  // Portfolio card click
  document.querySelectorAll('[data-gallery]').forEach(card => {
    card.addEventListener('click', () => {
      openLightbox(card.dataset.gallery);
    });
  });
}
