# Tugas 1 Grafika Komputer - Ekosistem Bawah Laut

---

| Nama Lengkap | NRP | 
| --- | --- |
| Muhammad Zaky Zein | 5025241148 | 
| Isabella Sienna Sulisthio | 5025241199 | 

Proyek ini adalah visualisasi 2D bertema bawah laut yang dibuat sebagai tugas grafika komputer menggunakan **JavaScript** dan **WebGL 2**. Seluruh objek pada scene dibangun dari geometri dasar seperti polygon, triangle, circle, rectangle, dan leaf, kemudian dirender ke canvas dengan transformasi matriks 3×3.

Scene menampilkan ikan, gelembung, tanaman laut, coral, dasar laut, batu, kerang, dan sea creature. Beberapa elemen dianimasikan secara kontinu, sedangkan ikan utama dapat dikendalikan melalui keyboard.

## Fitur

- Rendering 2D menggunakan WebGL2 dan shader GLSL.
- Transformasi translation, rotation, dan scaling menggunakan matriks 3×3.
- Animasi ikan, gelembung, tanaman, coral, kerang, sea creature, dan cahaya bawah laut.
- Alpha blending untuk objek transparan dan efek blur.
- Kontrol keyboard untuk menggerakkan, memutar, dan mengubah ukuran ikan utama.
- Tombol pause, reset, pengaturan kecepatan animasi, serta tampilan pivot.
- Penanganan WebGL context lost dan context restored.
- Gambar referensi ditampilkan berdampingan dengan hasil render.

## Tampilan

File **reference.jpg** digunakan sebagai acuan visual dan ditampilkan di samping canvas. Aplikasi utama dapat dibuka dari [computer-graphics-task-1/index.html](computer-graphics-task-1/index.html).

## Struktur Project

~~~text

└── computer-graphics-task-1/
    ├── index.html              # Halaman utama dan elemen canvas
    ├── main.js                 # Orkestrasi scene, lifecycle, dan render loop
    ├── matrix3.js              # Operasi matriks transformasi 3×3
    ├── style.css               # Tampilan halaman dan layout UI
    ├── reference.jpg           # Gambar referensi scene
    └── js/
        ├── webgl.js            # Inisialisasi WebGL, shader, VAO, dan buffer
        ├── primitives.js       # Primitive geometry dan helper drawing
        ├── controls.js         # Input keyboard dan kontrol runtime
        └── objects/
            ├── ocean.js        # Background laut dan efek cahaya
            ├── fish.js         # Data, mesh, animasi, dan drawing ikan
            ├── bubbles.js      # Gelembung dan specks air
            ├── plants.js       # Tanaman laut
            ├── corals.js       # Coral bercabang
            ├── seabed.js       # Dasar laut, batu, dan stones
            ├── seaCreature.js  # Sea creature dan efek transparansi
            └── shells.js       # Kerang
    └── README.md
~~~

## Arsitektur Singkat

Project memisahkan data scene, geometry GPU, transformasi, input, dan proses rendering.

| Bagian | Tanggung jawab |
|---|---|
| **main.js** | Menggabungkan semua modul, membuat scene, menjalankan update dan draw setiap frame. |
| **matrix3.js** | Menyediakan identity, translation, rotation, scaling, perkalian matriks, dan helper transform. |
| **webgl.js** | Membuat context WebGL2, compile/link shader, membuat mesh, dan mengatur blending. |
| **primitives.js** | Membuat geometry dasar serta fungsi draw polygon, ellipse, dan line. |
| **controls.js** | Membaca input keyboard dan menerapkannya pada transform ikan utama. |
| **objects/** | Mendefinisikan data dan cara menggambar setiap bagian scene. |

## Alur Kerja Kode

### 1. Halaman dimuat

**index.html** menyediakan canvas berukuran 1200×1260, area gambar referensi, dan informasi kontrol. **main.js** dimuat sebagai JavaScript module.

### 2. Data scene dibuat

Saat module dijalankan, **main.js** memanggil fungsi create data dari setiap object. Hasilnya disimpan dalam object scene. Snapshot initialScene dibuat agar scene dapat dikembalikan ke kondisi awal.

~~~text
createLightData()
createFishData()
createBubbleData()
createPlantData()
createCoralData()
createSeabedData()
createCreatureData()
createShellData()
~~~

### 3. WebGL dan mesh diinisialisasi

Fungsi init memanggil initWebGL(canvas). Tahap ini:

1. Meminta context webgl2 dari canvas.
2. Compile vertex shader dan fragment shader.
3. Link keduanya menjadi shader program.
4. Mengambil lokasi uniform seperti matrix, color, time, dan data cahaya.
5. Mengaktifkan alpha blending dan menonaktifkan depth test.
6. Membuat mesh primitive, mesh ikan, mesh creature, dan mesh seabed.

Mesh dibuat sekali saat inisialisasi dan dipakai kembali pada setiap frame. Posisi, rotasi, dan skala tidak mengubah vertex buffer; perubahan tersebut dikirim melalui uniform u_matrix.

### 4. Render loop berjalan

Browser memanggil render(timestamp) melalui requestAnimationFrame.

~~~text
requestAnimationFrame
        ↓
render(timestamp)
        ↓
hitung deltaTime
        ↓
update(deltaTime)
        ↓
draw()
        ↓
requestAnimationFrame berikutnya
~~~

deltaTime dibatasi maksimal 0,1 detik agar animasi tidak meloncat terlalu jauh ketika browser mengalami jeda.

### 5. Update state dan input

update memproses input keyboard untuk ikan utama dan menambah state.time ketika animasi tidak sedang pause. Kecepatan otomatis dikontrol oleh state.speed.

Beberapa object menghitung gerak langsung ketika digambar berdasarkan state.time. Dengan demikian, tidak semua object membutuhkan fungsi update terpisah.

### 6. Object digambar berurutan

Depth test dimatikan sehingga urutan pemanggilan draw menerapkan painter's algorithm: object yang digambar belakangan berada di depan object sebelumnya.

~~~text
1. Ocean/background dan cahaya
2. Gelembung layer belakang
3. Tanaman
4. Coral
5. Ikan
6. Dasar laut
7. Sea creature layer belakang
8. Batu
9. Kerang
10. Stones/detail dasar laut
11. Gelembung layer depan
~~~

Setiap helper drawing mengirim matrix transform dan warna ke GPU, lalu memanggil gl.drawArrays().

### 7. Shader menghasilkan pixel

Vertex shader mengubah posisi lokal vertex menggunakan u_matrix:

~~~glsl
vec3 world = u_matrix * vec3(a_position, 1.0);
gl_Position = vec4(world.xy, 0.0, 1.0);
~~~

Fragment shader menentukan warna akhir. Untuk background laut, shader menghitung gradasi warna, berkas cahaya yang bergerak, shimmer, dan grain. Alpha blending digunakan untuk objek dengan transparansi.

## Transformasi Matriks

matrix3.js menggunakan koordinat homogen 2D. Transformasi lokal dibentuk dengan urutan:

~~~text
parent × translation × rotation × scaling
~~~

Fungsi transform(parent, x, y, sx, sy, rotation) menghasilkan matrix baru berdasarkan parent matrix. Pola ini memungkinkan object memiliki transformasi bertingkat, misalnya ekor ikan mengikuti badan ikan tetapi tetap mempunyai rotasi lokal sendiri.

## Kontrol Keyboard

Canvas perlu mendapatkan focus terlebih dahulu dengan klik pada canvas.

| Tombol | Fungsi |
|---|---|
| Arrow Left/Up/Down/Right | Menggerakkan ikan utama |
| Q / E | Memutar ikan berlawanan / searah jarum jam |
| Z / X | Mengecilkan / membesarkan ikan |
| Space | Pause atau menjalankan animasi |
| Shift + R | Reset seluruh scene |
| R | Reset transform ikan utama |
| Home | Kembali ke reference pose |
| [ / ] | Mengurangi / menambah kecepatan animasi |
| P | Menampilkan atau menyembunyikan titik pivot |

Posisi ikan dibatasi pada area scene dan gerakan diagonal dinormalisasi agar kecepatannya tetap konsisten.

