/** 
 * 1. Render songs -> DONE
 * 2. Scroll top -> DONE
 * 3. Play, pause, seek -> DONE
 * 4. CD rotate -> DONE
 * 5. Next/ prev -> DONE
 * 6. Random play -> DONE
 * 6+. NOT play visited song when random until end list -> DONE
 * 7. Next/ repeat when song is end -> DONE
 * 8. Active song -> DONE
 * 9. Scroll active song into view -> DONE
 * 10. Play song when click -> DONE
 * **/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MS_PLAYER'

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-previous');
const randomBtn = $('.btn-random');
const replayBtn = $('.btn-replay');
const playlist = $('.playlist');
let songItems = [];

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isReplay: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    visitedIndexes: [],
    songs: [
        {
            name: 'Em đồng ý (I do)',
            singer: 'Đức Phúc',
            image: './assets/img/EmDongY.jpg',
            path: './assets/music/EmDongY.mp3'
        },
        {
            name: 'Ghệ iu dấu của em ơi',
            singer: 'TLinh',
            image: './assets/img/GheIuDauCuaEmOi.jpg',
            path: './assets/music/GheIuDauCuaEmOi.mp3'
        },
        {
            name: 'Khi người mình yêu khóc',
            singer: 'Phan Mạnh Quỳnh',
            image: './assets/img/KhiNguoiMinhYeuKhoc.webp',
            path: './assets/music/KhiNguoiMinhYeuKhoc.mp3'
        },
        {
            name: 'Nếu lúc đó',
            singer: 'TLinh',
            image: './assets/img/NeuLucDo.jpg',
            path: './assets/music/NeuLucDo.mp3'
        },
        {
            name: 'Ổ quỷ',
            singer: 'DMT, Nguyễn Băng Qua, Trần Lả Lướt, Rocky CDE',
            image: './assets/img/OQuy.jpg',
            path: './assets/music/OQuy.mp3'
        },

        {
            name: 'Em đồng ý (I do)',
            singer: 'Đức Phúc',
            image: './assets/img/EmDongY.jpg',
            path: './assets/music/EmDongY.mp3'
        },
        {
            name: 'Ghệ iu dấu của em ơi',
            singer: 'TLinh',
            image: './assets/img/GheIuDauCuaEmOi.jpg',
            path: './assets/music/GheIuDauCuaEmOi.mp3'
        },
        {
            name: 'Khi người mình yêu khóc',
            singer: 'Phan Mạnh Quỳnh',
            image: './assets/img/KhiNguoiMinhYeuKhoc.webp',
            path: './assets/music/KhiNguoiMinhYeuKhoc.mp3'
        },
        {
            name: 'Nếu lúc đó',
            singer: 'TLinh',
            image: './assets/img/NeuLucDo.jpg',
            path: './assets/music/NeuLucDo.mp3'
        },
        {
            name: 'Ổ quỷ',
            singer: 'DMT, Nguyễn Băng Qua, Trần Lả Lướt, Rocky CDE',
            image: './assets/img/OQuy.jpg',
            path: './assets/music/OQuy.mp3'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => `
            <div key="${index}" data-index=${index} class="song">
                <div 
                  class="thumb" 
                  style="background-image: url('${song.image}')"
                >
                </div>

                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>

                <div class="option">
                    <i class="fa-solid fa-ellipsis"></i>
                </div>
            </div>
        `);
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom || false;
        this.isReplay = this.config.isReplay || false;
    },
    handleEvents: function() {
        const cdWidth = cd.offsetWidth;

        // Scroll down to scale down CD
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        const cdThumbAnimate = cdThumb.animate(
            [
                {transform: "rotate(360deg)"}
            ],
            {
                duration: 10000,
                iterations: Infinity
            }
        )
        cdThumbAnimate.pause();

        // Control audio
        playBtn.onclick = () => {
            if (app.isPlaying) {
                audio.pause();
                cdThumbAnimate.pause();
            } else {
                audio.play();
                cdThumbAnimate.play();
            }
        }

        audio.onplay = () => {
            app.isPlaying = true;
            player.classList.add('playing');
        }

        audio.onpause = () => {
            app.isPlaying = false;
            player.classList.remove('playing');
        }

        audio.onended = () => {
            cdThumbAnimate.pause();
            if (!app.isReplay) {
                if (app.isRandom) {
                    app.playRandomSong();
                } else {
                    app.nextSong();
                }
                audio.play();
            }
        }

        audio.ontimeupdate = () => {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        progress.oninput = (event) => {
            const seekTime = event.target.value / 100 * audio.duration;
            audio.currentTime = seekTime;
        }

        // Next/Prev song
        nextBtn.onclick = () => {
            if (app.isRandom) {
                app.playRandomSong();
            } else {
                app.nextSong();
            }
            audio.play();
        }

        prevBtn.onclick = () => {
            if (app.isRandom) {
                app.playRandomSong();
            } else {
                app.prevSong();
            }
            audio.play();
        }

        // Active random song
        randomBtn.onclick = () => {
            app.isRandom = !app.isRandom;
            randomBtn.classList.toggle('active', app.isRandom);
            app.setConfig('isRandom', app.isRandom);
        }

        // Active replay
        replayBtn.onclick = () => {
            app.isReplay = !app.isReplay;
            replayBtn.classList.toggle('active', app.isReplay);
            audio.loop = app.isReplay;
            app.setConfig('isReplay', app.isReplay);
        }

        // Play song on click
        playlist.onclick = (e) => {
            const songNode = e.target.closest('.song:not(.active)')
            if(e.target.closest('.option')) {
                console.log("Mở tùy chọn")
            } else {
                if (songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    app.getActiveSong();
                    audio.play();
                }
            }
        }
    },
    nextSong: function() {
        this.currentIndex++;
        
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        this.getActiveSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        this.getActiveSong();
    },
    playRandomSong: function() {
        let newIndex;

        if (this.visitedIndexes.length === this.songs.length) {
            this.visitedIndexes.splice(0, this.visitedIndexes.length)
        } 

        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex || this.visitedIndexes.includes(newIndex))
        
        this.visitedIndexes.push(newIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
        this.getActiveSong();
    },
    getActiveSong: function() {
        songItems.forEach(songItem => {
            songItem.classList.remove('active');

            if (songItem.getAttribute('key') === this.currentIndex.toString()) {
                songItem.classList.add('active');
            }
        })

        // Scroll active song into view
        setTimeout(() => {
            const songActive = $('.song.active');
            if (songActive.getAttribute('key') >= 3) {
                songActive.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            } else {
                songActive.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }
        }, 300)
    }, 
    start: function() {
        this.loadConfig();
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();

        this.render();
        songItems = $$('.song');
        this.getActiveSong();

        randomBtn.classList.toggle('active', this.isRandom);
        replayBtn.classList.toggle('active', this.isReplay)
        audio.loop = app.isReplay;
    }
}

app.start();