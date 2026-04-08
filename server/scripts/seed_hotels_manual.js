/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');

const hotels = [
  { name: 'Hotel Panchavati Yatri', category: 'Budget', address: '430, Vakil Wadi (Chandak Wadi), M. G. Road, Nashik 422001', image_url: 'https://content.jdmagicbox.com/comp/nashik/g6/0253px253.x253.121102114405.m6g6/catalogue/hotel-panchavati-m-g-road-nashik-hotels-n8hn90q6k9.jpg' },
  { name: 'Ginger Nashik', category: 'Budget', address: 'Near Satpur MIDC Police Station, Nashik-Trimbakeshwar Road, Satpur, Nashik 422007', image_url: 'https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_267,q_40,w_400/hotelier-images/e4/ef/6a3137d8e209b108224ca15d071aaba363dad82601ca96fd752fb94a334d.jpeg' },
  { name: 'ibis Nashik (Accor)', category: 'Budget / Mid', address: 'Plot No. 9, Nashik-Triambakeshwar Road, MIDC, Nashik 422007', image_url: 'https://gos3.ibcdn.com/a1ea0c8c825b11e7bdaf025f77df004f.jpg' },
  { name: 'Hotel Happy Times', category: 'Budget', address: 'Shalimar Chowk, Nashik', image_url: 'https://gos3.ibcdn.com/9e367714276d11ebb77f0242ac110003.jpg' },
  { name: 'Hotel Triton', category: 'Budget', address: 'Central Nashik, near market area', image_url: 'https://cdn-zen.readytotrip.com/t/1024x768/content/77/dc/77dc7579e2fdb9056b79d6c1daef931f7ab33e17.jpeg' },
  { name: 'Hotel Avanti', category: 'Budget', address: 'Near Someshwar Temple, Panchavati, Nashik', image_url: 'https://r1imghtlak.mmtcdn.com/52087096b44011e9a67c0202c34c106a.jpg' },
  { name: 'Hotel City Palace', category: 'Budget', address: 'Old Nashik, Market Area', image_url: 'https://r2imghtlak.mmtcdn.com/r2-mmt-htl-image/htl-imgs/201405241443561874-f11a582635e511ea9cf70242ac110002.jpg' },
  { name: 'Hotel Curry Leaves', category: 'Budget', address: 'City Center, Nashik', image_url: 'https://b.zmtcdn.com/data/pictures/4/19787314/07d043e164ce8360d10907fceeaa47dd.jpg?fit=around|750:500&crop=750:500;*,*' },
  { name: 'SSK Solitaire Boutique Hotel & Spa', category: 'Economy / Mid', address: 'Central Nashik', image_url: 'https://r2imghtlak.mmtcdn.com/r2-mmt-htl-image/htl-imgs/202501282004492008-d3416d49-503c-4ce3-941a-47b5815971f3.jpg' },
  { name: 'Hotel Panchavati Elite Inn', category: 'Budget', address: 'Vakil Wadi, Panchavati, Nashik', image_url: 'https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_627,q_auto,w_1200/hotelier-images/da/e1/6c3a93c5195d1382ffc87d0d716d054ec4db216569b3c8e9187b3a26304a.jpeg' },
  { name: 'Hotel The Marion', category: 'Mid-Budget', address: 'Central Nashik', image_url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/544869301.jpg?k=70d7d82edb81ea4beca5e18701346036659ac0ab33d19db85c6d5541fafb59ef&o=' },
  { name: 'Express Inn – The Business Luxury Hotel', category: 'Mid', address: 'Pathardi Phata, Mumbai-Agra Road, Ambad, Nashik 422010', image_url: 'https://d25wybtmjgh8lz.cloudfront.net/sites/default/files/styles/ph_masthead_1900x750/public/property/img-mastheads/bomei_1.jpg?h=f197ddcb' },
  { name: 'Gateway Hotel (Taj)', category: 'Mid / Upper-Mid', address: 'P-17, MIDC Ambad, Mumbai-Agra Road, Nashik 422010', image_url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/68515150.jpg?k=782e805952b2a906e4681f206edd6a12f69cd4a7fea8f9a4215be848ea45a87c&o=' },
  { name: 'Four Points by Sheraton', category: 'Upper-Mid / 4★', address: 'Govind Nagar, Nashik', image_url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/66/d6/47/facade.jpg?w=900&h=500&s=1' },
  { name: 'The Source at Sula', category: 'Mid / Boutique', address: 'Sula Vineyards, Gangavhare, Nashik', image_url: 'https://images.trvl-media.com/lodging/24000000/23920000/23911600/23911506/e0c5b2b5.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill' },
  { name: 'Regenta Resort Soma Vine Village', category: 'Mid / Resort', address: 'Soma Vine Village, Gangapur-Gangavhare Road, Nashik', image_url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/53/bb/35/resort-pool-overview.jpg?w=900&h=500&s=1' },
  { name: 'Palm Springs Resort', category: 'Mid / Resort', address: 'Vineyard Belt, Nashik', image_url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/541845408.jpg?k=81c4aa72e9f9c05208990b7497f548ffccfb8cb28e19397b65f989a4116e2abc&o=' },
  { name: 'Grape County Eco Resort & Spa', category: 'Mid / Upper-Mid', address: 'Anjaneri, Trimbakeshwar Road, Nashik', image_url: 'https://grapecounty.in/wp-content/uploads/2025/03/LuxeRetreat.jpg' },
  { name: 'Courtyard by Marriott Nashik', category: 'High / 5★', address: 'Mumbai Naka, Mumbai-Agra Highway, Nashik', image_url: 'https://r1imghtlak.mmtcdn.com/d75a895e42eb11ed83ab0a58a9feac02.jpg' },
  { name: 'Radisson Blu Hotel & Spa', category: 'High / 5★', address: '289/2, Near Ekta Green Ville, Pathardi Shivar, Nashik', image_url: 'https://media.radissonhotels.net/image/radisson-blu-hotel-spa-nashik/exterior/16256-126780-m26046072.jpg' },
  { name: 'Beyond by Sula', category: 'Luxury / Resort', address: 'Village Gangavhare, Nashik 422222', image_url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/b3/41/78/beyond-by-sula.jpg?w=900&h=500&s=1' },
  { name: 'Viveda Wellness Resort', category: 'Luxury / Wellness', address: 'Trimbak Road, Nashik', image_url: 'https://gos3.ibcdn.com/e4b40272-cfab-40ed-9483-0c92c9db1489.jpg' },
  { name: 'Savana Lake Resort', category: 'Upper-Mid / Resort', address: 'Near Gangapur Dam, Nashik', image_url: 'https://lh6.googleusercontent.com/proxy/j7SP-4HTuWnLB3cwLbIDKF-YxvB4n7TCf1gPSAnvB0fL4sLeuG7dq04NcrGQWE11gBarBwA' },
  { name: 'Hotel The Haven by Sula', category: 'Mid / Boutique', address: 'Sula Vineyard Region, Nashik', image_url: 'https://r2imghtlak.mmtcdn.com/r2-mmt-htl-image/htl-imgs/202509221757121451-9b93df76-4a72-4d7f-8658-2b1b690e8dfa.jpg' },
  { name: 'Hotel Marion', category: 'Mid', address: 'Central Nashik', image_url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/544869301.jpg?k=70d7d82edb81ea4beca5e18701346036659ac0ab33d19db85c6d5541fafb59ef&o=' }
];

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
    await mongoose.connect(process.env.MONGODB_URI);

    const docs = hotels.map(h => ({
      name: h.name,
      nameHindi: '',
      address: h.address,
      price: 2500,
      rating: 4.2,
      reviews: 50,
      amenities: [],
      image_url: h.image_url,
      verified: true,
      // location left undefined (no coordinates provided)
    }));

    await Hotel.deleteMany({});
    await Hotel.insertMany(docs);
    console.log(`Inserted ${docs.length} hotels`);
    process.exit(0);
  } catch (e) {
    console.error('Seed hotels failed:', e.message);
    process.exit(1);
  }
})();


