/** 
 * 1. Render songs -> DONE
 * 2. Scroll top -> DONE
 * 3. Play, pause, seek -> DONE
 * 4. CD rotate -> DONE
 * 5. Next/ prev -> DONE
 * 6. Random play -> DONE
 * 6+. NOT play visited song when random until end list -> DONE
 * 7. Next/ repeat when song is end
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 * **/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

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

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
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
    ],
    render: function() {
        const htmls = this.songs.map((song, index) => `
            <div key="${index}" class="song">
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
        $('.playlist').innerHTML = htmls.join('');
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
            if (this.isRandom) {
                app.playRandomSong();
            } else {
                app.nextSong();
            }
            audio.play();
        }

        prevBtn.onclick = () => {
            if (this.isRandom) {
                app.playRandomSong();
            } else {
                app.prevSong();
            }
            audio.play();
        }

        // Active random song
        randomBtn.onclick = () => {
                this.isRandom = !this.isRandom;
                randomBtn.classList.toggle('active', this.isRandom);
        }
    },
    nextSong: function() {
        this.currentIndex++;
        
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
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
        console.log(this.visitedIndexes)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        
        this.render();
    }
}

app.start();