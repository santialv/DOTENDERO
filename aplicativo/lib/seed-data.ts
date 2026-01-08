export const ORIGINAL_PRODUCTS = [
    { id: "1", name: "Coca-Cola Sabor Original 1.5L", price: 5500, costPrice: 4200, category: "Bebidas", brand: "Coca-Cola", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2zMjDT28_eaQ_r6b9E5kYeTmJ3eJPwef-4eSNxZeX-hVXP-r72SmxJWd3yCGfNiq7afseDos7DEB7AxaKKyBKOIKAweh1U28uQyCauYx9S-s6XLBQt8gdEZEq2Vv3CaXM3c2U0nJI_lAYXBleSiMc5eIipdHZSj7hy9hYLcCMzxkIe_e756x2PO_stQc6mdze8VuBv-SzpmhjtYQ9bagKkSobUKpHTs5wf4PyqMhi94GSS4cxR1TpEYcpTCQ3ZvWKuPRPllE943g", stock: 150, minStock: 20, barcode: "7701234567890", status: "Activo", tax: 19, bagTax: 60, icaRate: 11.04 },
    { id: "2", name: "Arroz Diana Blanco 500g", price: 2800, costPrice: 2100, category: "Abarrotes", brand: "Diana", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsQFe5JUSw9Qs0Q2gXj4GeeCBXSDpHcuT2W-fvUMLovG-XwTPEW0dTHkim2rcLHB_V7HfeibG9pkiEEOO1s72D_3pkAaSLuKmyTr2gDWheoPZDLud28Yky5BT9XyR3-FoXwXyB6H0W4tUyQptHI7j3wlKuUGnTLMeGQtsGsMeO3rkwbEsaYB3-9q9zK9jxRipY6Isjas4vw5YIJtbRLP6EIGcudXAHL2lDrIIYBRhUExxv5DGH166fSixkqM8ZNvYFaG4St333JTw", stock: 80, minStock: 15, barcode: "7701234567891", status: "Activo" },
    { id: "3", name: "Pan Bimbo Tajado Blanco", price: 4500, costPrice: 3800, category: "Panadería", brand: "Bimbo", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcQjveLHsgyClB04l9LGL1G54tVUfDzvqFwUAhtorq5u21QsKSd7HwA66bDng_ZAzCljdBCZWuWXjm7gp4dOQSEH9Vzy3r4SVbo5j0WQExl9ol4T0zqfNkopHZUOMu26scXAr9HwG-XokZ2ftG-ND1yoAekXQmG0zHC-i5rDgamTemf0FWH_V7b8bKTGirhwveImzNQ4tLg38QXSVU0UA0yIOkfBsVEzMU1eheX46mYerOU-mRYaRIHXv2t3SxRZGbqnkE6uRIY_Q", stock: 40, minStock: 10, barcode: "7701234567892", status: "Activo" },
    { id: "4", name: "Leche Entera Alquería 1L", price: 3200, costPrice: 2500, category: "Lácteos", brand: "Alquería", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAg1aZ5QhhNVyOKFz4Oll5K-Y8pBnVObPKbX8hjQ3iWjoB6kkA5Y-YYBjDsbCx_ZeYUzb58P6CDZ_v8ebDnBXblQYW7X5IsbBbmzb0RH2UnGJZDf1Aez6kd3qnlDsbMHOAKA1vZM_tdqj6uBSINy3e4dWzanmRUBsbae4N0Nr2rDAi2l4PNaknPRW0twbBPEEnGpZ4bG4wolAQt7if9aNiCGiR3-Q-xI3gj_gKKZI0rFvjcqhRbtjUI_U3jjY1DwRv34QftUAyjUl4", stock: 60, minStock: 12, barcode: "7701234567893", status: "Activo" },
    { id: "5", name: "Papas Margarita Pollo", price: 2000, costPrice: 1500, category: "Snacks", brand: "Margarita", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7CGBiD1OBr0tHH7NSKqGf63gz2Le_9W62QnvGc_h2KmbOsJtxFLZeLkwO0QT73YKiWkGXvK1dSbk5Zl3gw0sVhE53Aoi1XTIkbQcZKXVyV561USnWPHyy_x4UYWNA-3gZG74TYmXMP0PjUiefZh6M8UTv5-eIXxGZ1qvZ2S1rMxlF2Y57UqEwJlDKGem33DAq_nwYMv_yO1fhPrntbQYSdnbsVf51HkzzVD3hSCTHZLarl3BmN5kriaqa_f_j6491FevmtZJPl_A", stock: 100, minStock: 25, barcode: "7701234567894", status: "Activo" },
    { id: "6", name: "Huevos Rojos AA (Unidad)", price: 600, costPrice: 400, category: "Abarrotes", brand: "Kikes", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxSoxTEEsMLZEHRxsNnvMoQLGSr5P0laGOr6qjjVrLtHzEN-MVqbkGoqLtlOGTzPZZxL4uy2oET4EN_gXoAg6pqSiYPET6oemLZp5HPDeB-HvYsWVRFSRI3aqzvns3yrK7QhTRtgVbvbHBlGj2e_T1uZiGu0yBUywWnzhclwG_BMSc9qnRm6TqNYsu_97XLnSc9k7otPI9DNVn06Ko3rrSIjfO4smX5Fi9vzeT6sh9l4yRTJA30jZHHDZzYm1A_oRiXrZ0e00kek0", stock: 200, minStock: 50, barcode: "7701234567895", status: "Activo" },
    { id: "7", name: "Aceite Gourmet Familia 1L", price: 8500, costPrice: 6800, category: "Abarrotes", brand: "Gourmet", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEIrrGQ7ZbqkPUVf-HDdv3G9FjUP3pO2d2FYTFPECnv6O7T9zLd4l4mPjwTI4jrTghpsSWoz3TrscURw7GXnubH34VHscP1LR1oQgku8RrWpRxoxrDuP1vVD1yb9t-M7kbDEolrSiSITvmd8qBV_vWvbrkpuf0xoW8W53eG4MGwNsTBICcBrTtKgSr8eEeD8QemtVKoUeMCIdfZvaFyK3cNKEdqbo40foJ6af37OlQdlVb_f3sPSeH4rnRsZv5CgqrkKvwax0lRgE", stock: 35, minStock: 8, barcode: "7701234567896", status: "Activo" },
    { id: "8", name: "Azúcar Manuelita 1Kg", price: 3000, costPrice: 2400, category: "Abarrotes", brand: "Manuelita", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0bHrzaD45Kr6yGeDtcLUN6LGGqcksx-jfrsja6Dm28LXlSLsUvahtllWbnUsmxuOt2y5aF0LWUVDmOvXFwNXLcMycVZWGaL5rEtq5r9ypAkboKbru1VtkSN7w-DouiFSi9AqtS2nI5VxglcImr7MJ98OlD2CgD9PP-B3YtivV3Az-h3a-OpWNf0IWd-KIV-dzQHsX_npOQ-9VBlIxEYF68zYZAWhus_eearhFDTKwVL7x_rzauH1JfjEvjtw_uCrVYRNZgIlBwyI", stock: 55, minStock: 10, barcode: "7701234567897", status: "Activo" },
    { id: "9", name: "Detergente Fab Polvo 1Kg", price: 9500, costPrice: 7500, category: "Aseo", brand: "Fab", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz72e2u56oYw-SjU5Z73Qe1s6-eWv8r6qH4A&s", stock: 30, minStock: 5, barcode: "7701234567898", status: "Activo" },
    { id: "10", name: "Cerveza Poker Lata", price: 3500, costPrice: 2800, category: "Licores", brand: "Poker", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ72e2u56oYw-SjU5Z73Qe1s6-eWv8r6qH4A&s", stock: 120, minStock: 24, barcode: "7701234567899", status: "Activo", tax: 19, bagTax: 0, icaRate: 11.04 },
    { id: "11", name: "Papel Higiénico Familia 4 Rollos", price: 7500, costPrice: 5500, category: "Aseo", brand: "Familia", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ72e2u56oYw-SjU5Z73Qe1s6-eWv8r6qH4A&s", stock: 45, minStock: 12, barcode: "7701234567800", status: "Activo" },
];

export const GENERATED_PRODUCTS = Array.from({ length: 500 }, (_, i) => {
    const categories = ["Bebidas", "Abarrotes", "Panadería", "Lácteos", "Snacks", "Licores", "Aseo"];
    const brands = ["Generico", "DonTendero", "Local", "Premium", "Económico"];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const price = (Math.floor(Math.random() * 50) + 1) * 500;

    return {
        id: (12 + i).toString(),
        name: `Producto Test ${i + 1} - ${cat}`,
        description: `Descripción generada para producto ${i + 1}`,
        price: price, // Sale Price
        salePrice: price, // Matching Inventory Interface
        costPrice: price * 0.7, // 30% margin approx
        category: cat,
        brand: brand,
        image: "",
        stock: Math.floor(Math.random() * 100),
        minStock: 10,
        barcode: `770${String(12 + i).padStart(10, '0')}`,
        tax: 19,
        unit: "und",
        status: "Activo"
    };
});

export const SEED_PRODUCTS = [...ORIGINAL_PRODUCTS.map(p => ({
    ...p,
    salePrice: p.price, // Ensure compatibility with both interfaces if needed
    description: p.name,
    tax: p.tax !== undefined ? p.tax : 19,
    bagTax: (p as any).bagTax || 0,
    icaRate: (p as any).icaRate || 9.66,
    unit: "und"
})), ...GENERATED_PRODUCTS];
