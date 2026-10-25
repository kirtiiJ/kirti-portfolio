const photo = (number, id, title, alt) => ({ id, title, alt, image: `assets/snapshots/${number}.jpg`, thumbnail: `assets/snapshots/${number}-thumb.jpg` });

export const snapshotAlbums = [
  { id: 'cafe-hopping', title: 'Café Hopping', summary: 'Coffee stops and slow afternoons.', cover: 0, photos: [
    photo(3, 'sunday-matcha', 'Sunday Matcha', 'Iced matcha beside sunflowers at a café window'),
    photo(6, 'coffee-on-ice', 'Coffee on Ice', 'A layered iced coffee on a wooden café table'),
    photo(7, 'slow-morning', 'A Slow Morning', 'Latte art in a white cup on a sunny patio'),
    photo(14, 'petals-and-coffee', 'Petals & Coffee', 'A latte topped with rose petals, served with a biscuit'),
    photo(19, 'blue-cup', 'The Blue Cup', 'Coffee in a blue ceramic cup in a softly lit café'),
  ] },
  { id: 'chasing-sunsets', title: 'Chasing Sunsets', summary: 'Always time for one more sky.', cover: 3, photos: [
    photo(4, 'sky-on-fire', 'A Sky on Fire', 'Orange-lit clouds above a silhouetted city skyline'),
    photo(9, 'golden-waves', 'Golden Waves', 'The sun reflecting across waves and wet beach sand'),
    photo(10, 'sunset-reflections', 'Sunset Reflections', 'Golden sunlight over a lake beneath dark mountain silhouettes'),
    photo(22, 'last-light', 'The Last Light', 'A pink and orange evening sky above a lakeside city'),
  ] },
  { id: 'trails-and-escapes', title: 'Trails & Escapes', summary: 'Fresh air and a change of perspective.', cover: 1, photos: [
    photo(8, 'cloud-watch', 'Cloud Watch', 'Large clouds gathering over hills and a distant lake'),
    photo(15, 'wildflowers', 'Through the Wildflowers', 'A hiker following a narrow trail through purple wildflowers'),
    photo(16, 'green-horizons', 'Green Horizons', 'Lush green mountain ridges with a lake in the distance'),
    photo(20, 'pause-at-the-top', 'A Pause at the Top', 'A hiker with a red backpack sitting on a rocky summit'),
  ] },
  { id: 'everyday-frames', title: 'Everyday Frames', summary: 'Little things that catch my eye.', cover: 2, photos: [
    photo(5, 'after-dark', 'After Dark', 'An illuminated palace reflected in the water at night'),
    photo(17, 'little-sunshine', 'A Little Sunshine', 'A hand holding small yellow wildflowers above a green valley'),
    photo(18, 'light-through-leaves', 'Light Through Leaves', 'Sunlight filtering through green leaves beside a lake'),
    photo(21, 'looking-up', 'Looking Up', 'A view of blue sky and clouds framed by tall trees'),
  ] },
].map(album => ({ ...album, type: 'Album' }));
