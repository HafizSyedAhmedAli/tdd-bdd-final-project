const { Product, Category } = require('../../src/models/product');
const { sequelize } = require('../../src/database/connection');
const { ProductFactory } = require('../factories');

describe('Product Model', () => {



    describe('Product Creation', () => {
        test('should create a product and assert that it exists', () => {
            const productData = {
                name: 'Fedora',
                description: 'A red hat',
                price: 12.50,
                available: true,
                category: Category.CLOTHS
            };

            const product = new Product(productData);

            expect(product).toBeDefined();
            expect(product.id).toBeNull(); // Not saved yet
            expect(product.name).toBe('Fedora');
            expect(product.description).toBe('A red hat');
            expect(product.available).toBe(true);
            expect(product.price).toBe(12.50);
            expect(product.category).toBe(Category.CLOTHS);
        });

        test('should add a product to the database', async () => {
            // Check database is empty
            const products = await Product.findAll();
            expect(products).toEqual([]);

            // Create product using factory
            const productData = ProductFactory.build();
            delete productData.id; // Remove ID so database assigns one

            const product = await Product.create(productData);

            // Assert that it was assigned an id and shows up in the database
            expect(product.id).toBeDefined();

            const allProducts = await Product.findAll();
            expect(allProducts.length).toBe(1);

            // Check that it matches the original product
            const newProduct = allProducts[0];
            expect(newProduct.name).toBe(productData.name);
            expect(newProduct.description).toBe(productData.description);
            expect(parseFloat(newProduct.price)).toBe(productData.price);
            expect(newProduct.available).toBe(productData.available);
            expect(newProduct.category).toBe(productData.category);
        });
    });

    //
    // ADD YOUR TEST CASES HERE
    //

    test('should read a product from the database', async () => {
        const product = ProductFactory.build();
        delete product.id;
        console.log("Product Created: ", product);
        const savedProduct = await Product.create(product);

        expect(savedProduct.id).not.toBe(null);

        const dbProduct = await Product.findByPk(savedProduct.id);

        expect(dbProduct.name).toBe(savedProduct.name);
        expect(dbProduct.description).toBe(savedProduct.description);
        expect(dbProduct.price).toBe(savedProduct.price);
        expect(dbProduct.available).toBe(savedProduct.available);
        expect(dbProduct.category).toBe(savedProduct.category);
    })

    test('should update a product', async () => {
        const product = ProductFactory.build();
        delete product.id;
        console.log("Product Created: ", product);

        const savedProduct = await Product.create(product);

        expect(savedProduct.id).not.toBe(null);
        console.log("Product Saved: ", savedProduct);

        savedProduct.description = "updated description";
        const originalId = savedProduct.id;
        await savedProduct.save();

        expect(savedProduct.id).toBe(originalId);
        expect(savedProduct.description).toBe("updated description");

        const products = await Product.findAll();
        expect(products.length).toBe(1);

        expect(products[0].id).toBe(originalId);
        expect(products[0].description).not.toBe("udpated description");
    })

    test('should delete a product', async () => {
        const product = ProductFactory.build();
        const savedProduct = await Product.create(product);

        const products = await Product.findAll();
        expect(products.length).toBe(1);

        await savedProduct.destroy();

        const productList = await Product.findAll();
        expect(productList.length).toBe(0);
    })

    test('should list all products', async () => {
        const products = await Product.findAll();
        expect(products.length).toBe(0);

        await ProductFactory.createList(5);

        const productList = await Product.findAll();
        expect(productList.length).toBe(5);
    })


    test('should find a product by name', async () => {
        const products = await ProductFactory.createList(5);

        const product = products[0].name;
        
        const count = products.filter(p => p.name === product).length;

        const productList = await Product.findByName(product);

        expect(productList.length).toBe(count);
        productList.forEach((p) => {
            expect(p.name).toBe(product);
        })
    })

    test('should find a product by availability', async () => {
        const products = await ProductFactory.createList(10);
        const product = products[0].available;
        const count = products.filter(p => p.available).length;

        const productList = await Product.findByAvailability(product);

        expect(productList.length).toBe(count);
        productList.forEach(p => {
            expect(p.available).toBe(product);
        })
    })

    test('should find a product by category', async () => {
        const products = await ProductFactory.createList(10);
        const category = products[0].category;
        const count = products.filter(p => p.category === category).length;

        const productList = await Product.findByCategory(category);

        expect(productList.length).toBe(count);
        productList.forEach(p => {
            expect(p.category).toBe(category);
        })
    })
});