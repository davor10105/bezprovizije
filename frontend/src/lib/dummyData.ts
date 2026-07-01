// place files you want to import through the `$lib` alias in this folder.
export const properties = [
    {
        id: 1,
        title: 'Stara gradska vila',
        description: "Velika vila s dobrim pogledom",
        price: 2500,
        sqm: 200,
        lat: 42.6507,
        lng: 18.0944,
        type: 'Kuća',
        status: 'rent',
        dateAvailable: '1. lipnja 2026.',
        dateAdded: '2026-04-28',
        address: "Industrijska 100",
        // should be images
        image:
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        is_approved: true,
        attributes: {
            sqm: 120,
            gardenSqm: 500,
            numRooms: 5,
            numBathrooms: 2,
            energy: "A",
            pool: true,
        }
    },
    {
        id: 2,
        title: 'Apartman Dioklecijan',
        price: 1200,
        lat: 43.5081,
        lng: 16.4402,
        type: 'Stan',
        status: 'rent',
        dateAvailable: '1. lipnja 2026.',
        address: "Split, Zagrebačka 100",
        dateAdded: '2026-04-28',
        sqm: 65,
        image:
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 3,
        title: 'Gornji grad, uređen stan',
        price: 350000,
        lat: 45.815,
        lng: 15.9819,
        type: 'Stan',
        status: 'sale',
        dateAvailable: '1. lipnja 2026.',
        address: "Zagreb, Ilica 100",
        dateAdded: '2026-04-28',
        sqm: 80,
        image:
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1380&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: 4,
        title: 'Kamena kuća s pogledom',
        price: 850000,
        lat: 45.0812,
        lng: 13.6387,
        type: 'Kuća',
        status: 'sale',
        dateAvailable: '1. lipnja 2026.',
        address: "Rovinj, Rovinjska 100",
        dateAdded: '2026-04-28',
        sqm: 200,
        image:
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 5,
        title: 'Građevinsko zemljište',
        price: 150000,
        lat: 44.1194,
        lng: 15.2314,
        type: 'Zemljište',
        status: 'sale',
        sqm: 800,
        address: "Zagreb, Zagrijaška 100",
        dateAvailable: '1. lipnja 2026.',
        dateAdded: '2026-04-28',
        image:
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 6,
        title: 'Garažno mjesto centar',
        price: 25000,
        address: "Kul, Ilica 100",
        lat: 44.1194,
        lng: 15.25,
        type: 'Garaža',
        status: 'sale',
        sqm: 15,
        dateAvailable: '1. lipnja 2026.',
        dateAdded: '2026-04-28',
        image:
            'https://plus.unsplash.com/premium_photo-1673886205989-24c637783c60?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: 7,
        title: 'Poslovni prostor za ured',
        address: "Zagreb, Ilica 100",
        price: 1800,
        lat: 44.1194,
        lng: 15.4,
        type: 'Poslovni',
        status: 'rent',
        sqm: 90,
        dateAvailable: '1. lipnja 2026.',
        dateAdded: '2026-04-28',
        image:
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
    }
]