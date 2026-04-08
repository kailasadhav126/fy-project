/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const MedicalService = require('../models/MedicalService');

const hospitals = [
  {
    name: 'Sahyadri Super Speciality Hospital',
    category: 'Private',
    address: 'Wadala Road, Dwarka, Nashik – 422011',
    open24x7: true,
    phone: '0253-6691666',
    image_url: 'https://assets.bajajfinservhealth.in/media/doctorprofilepic/1643444573216_HospitalFacilityImages_Capture-w720-h720.webp'
  },
  {
    name: 'Six Sigma Medicare & Research Ltd',
    category: 'Private',
    address: 'Mahatma Nagar, Nashik – 422007',
    open24x7: true,
    phone: '+91-8380001830',
    image_url: 'https://cdn.hexahealth.com/Image/1727415992055-578119233.png'
  },
  {
    name: 'Wockhardt Hospital (Nashik)',
    category: 'Private',
    address: 'Wadala Naka, Mumbai-Agra Rd, Nashik – 422001',
    open24x7: true,
    phone: '0253-6456569',
    image_url: 'https://static.medigence.com/uploads/hospital/images/2ecb60e127ea331b46deae0e601a4d98.jpg'
  },
  {
    name: 'KIMS Manavata Multi-speciality Hospital',
    category: 'Private',
    address: 'CIDCO / Nashik Road',
    open24x7: true,
    phone: '0253-6920000',
    image_url: 'https://media.assettype.com/pudharinews%2F2024-12-18%2F4jutkqr7%2Fkims.jpg?w=480&auto=format%2Ccompress'
  },
  {
    name: 'Ashoka Medicover Hospital',
    category: 'Private',
    address: 'Near Ashoka Marg, Nashik',
    open24x7: true,
    phone: '040-6833-4455',
    image_url: 'https://assets.bajajfinservhealth.in/media/doctorprofilepic/1640759330101_HospitalFacilityImages_Profile1-w800-h800.webp'
  },
  {
    name: 'Sukhatme Hospital',
    category: 'Private',
    address: 'Nashik',
    open24x7: false,
    phone: '020-48562555',
    image_url: 'https://content3.jdmagicbox.com/comp/nashik/t8/0253px253.x253.131004163006.z8t8/catalogue/sukhatme-maternity-home-gangapur-road-nashik-gynaecologist-and-obstetrician-doctors-d0qww.jpg'
  },
  {
    name: 'Ratnadeep Hospital',
    category: 'Private',
    address: 'Nashik Road',
    open24x7: true,
    phone: '0253-2462431',
    image_url: 'https://ratnadeephospital.in/wp-content/uploads/2022/07/IMG-20220701-WA0001.jpg'
  },
  {
    name: 'Supperrtech Hospital',
    category: 'Private',
    address: 'Panchvati, Nashik',
    open24x7: false,
    phone: '0253-2319005',
    image_url: 'https://content3.jdmagicbox.com/v2/comp/nashik/w3/0253px253.x253.161208131042.l4w3/catalogue/supperrtech-superspeciality-critical-care-and-plastic-surgery-center-panchavati-nashik-clinics-k99lmnvb9z.jpg'
  },
  {
    name: 'Chandrama Maternity Home',
    category: 'Specialty (Maternity & Women’s Health)',
    address: 'Panchvati, Nashik',
    open24x7: false,
    phone: '0253-2515103',
    image_url: 'https://content3.jdmagicbox.com/v2/comp/nashik/c8/0253px253.x253.160617124850.e2c8/catalogue/chandrama-maternity-home-and-advance-endoscopy-centre-panchavati-nashik-clinics-qtunx2pqc6.jpg'
  },
  {
    name: 'Indira Gandhi Hospital (NMC)',
    category: 'Government',
    address: 'Panchvati, under Nashik Municipal Corporation (NMC) Network',
    open24x7: true,
    phone: '0253-2578500',
    image_url: 'https://content3.jdmagicbox.com/comp/nashik/z3/0253px253.x253.160203055602.h9z3/catalogue/indira-gandhi-hospital-panchavati-nashik-hospitals-d1pb115gjg.jpg'
  },
  {
    name: 'Regional Referral / Civil Hospital Nashik',
    category: 'Government',
    address: 'Civil Hospital Campus, Nashik',
    open24x7: true,
    phone: '0253-2310881',
    image_url: 'https://content.jdmagicbox.com/comp/nashik/26/0253p253std3000626/catalogue/civil-hospital-trimbak-road-nashik-hospitals-28dr40l-250.jpg'
  },
  {
    name: 'Satpur Hospital',
    category: 'Government',
    address: 'Satpur Area, Nashik',
    open24x7: true,
    phone: '0253-2357008',
    image_url: 'https://content3.jdmagicbox.com/comp/nashik/i8/0253px253.x253.170208083759.b3i8/catalogue/esic-hospital-trimbak-road-nashik-hospitals-v7d4g.jpg'
  },
  {
    name: 'Dhanvantari Hospital',
    category: 'Private',
    address: 'Nashik',
    open24x7: false,
    phone: '0253-2575111',
    image_url: 'https://content.jdmagicbox.com/v2/nashik/h4/0253px253.x253.150914144647.j7h4/catalogue/dhanvantari-multispeciality-hospital-pimpalgaon-baswant-nashik-tb68-250.jpg'
  },
  {
    name: 'Dr. Lad’s Navjeevan Hospital & IVF',
    category: 'Specialty (IVF & Fertility)',
    address: 'Gangapur Road, Nashik',
    open24x7: false,
    phone: '0253-2574475',
    image_url: 'https://content3.jdmagicbox.com/v2/comp/nashik/83/0253p253std7000183/catalogue/dr-lads-navjeevan-hospital-pvt-ltd-tidke-colony-nashik-hospitals-dyty564n7g.jpg'
  },
  {
    name: 'Krishna Hospital',
    category: 'Private',
    address: 'Mumbai Naka, Nashik',
    open24x7: true,
    phone: '0253-2502010',
    image_url: 'https://content.jdmagicbox.com/comp/nashik/e1/0253px253.x253.170907024245.f5e1/catalogue/shri-krishna-maternity-hospital-dwarka-nashik-maternity-hospitals-enaypoah1i.jpg'
  },
  {
    name: 'Nelson Memorial Children Hospital',
    category: 'Specialty (Pediatric)',
    address: 'Tidke Colony – Near Mahamarg Bus Stand, Nashik',
    open24x7: false,
    phone: '0253-2581404',
    image_url: ''
  },
  {
    name: 'Rajebahadur Hospital & Research Centre Pvt. Ltd.',
    category: 'Private',
    address: 'Tilak Road, Nashik',
    open24x7: false,
    phone: '0253-2578555',
    image_url: 'https://content.jdmagicbox.com/comp/nashik/67/0253p253std2000067/catalogue/rajebahadur-hospital-and-research-center-pvt-ltd-tilak-road-nashik-hospitals-og8de.jpg'
  },
  {
    name: 'Prasanna Balrugnalay',
    category: 'Specialty (Pediatric)',
    address: 'Shazanpur Road, Nashik',
    open24x7: false,
    phone: '0253-2314321',
    image_url: 'https://content3.jdmagicbox.com/v2/comp/nashik/45/0253p253std4000345/catalogue/prasanna-balrugnalay-and-research-centre-pandit-colony-nashik-hospitals-87nlew1480.jpg'
  },
  {
    name: 'Oasis Fertility (Indira IVF)',
    category: 'Specialty (Fertility & IVF)',
    address: 'Govind Nagar, Nashik',
    open24x7: true,
    phone: '1800-103-2229',
    image_url: 'https://content3.jdmagicbox.com/comp/nashik/v7/0253px253.x253.230420045935.g2v7/catalogue/oasis-fertility-govind-nagar-nashik-fertility-centres-5umh0zgd9v.jpg'
  },
  {
    name: 'Mahesh Eye & Skin Hospital',
    category: 'Specialty (Eye / Skin)',
    address: 'Govind Nagar, Nashik',
    open24x7: false,
    phone: '0253-2577565',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYPdNgakxWtc_7BKqftLpFpExFRMQtBR1S2g&s'
  }
];

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
    await mongoose.connect(process.env.MONGODB_URI);

    // Transform to MedicalService schema
    const docs = hospitals.map(h => ({
      name: h.name,
      nameHindi: '',
      type: 'Hospital',
      typeHindi: '',
      category: h.category,
      categoryHindi: '',
      address: h.address,
      rating: 4.3,
      reviews: 100,
      services: [],
      servicesHindi: [],
      emergency: true,
      open24x7: !!h.open24x7,
      phone: h.phone,
      image_url: h.image_url,
      // No coordinates provided; can be geocoded later
    }));

    await MedicalService.deleteMany({ type: 'Hospital' });
    await MedicalService.insertMany(docs);

    console.log(`Inserted ${docs.length} hospitals`);
    process.exit(0);
  } catch (e) {
    console.error('Seed hospitals failed:', e.message);
    process.exit(1);
  }
})();


