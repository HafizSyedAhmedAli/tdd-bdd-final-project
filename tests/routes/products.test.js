const request = require('supertest');
const app = require('../../src/app');
const { Product } = require('../../src/models/product');
const { ProductFactory } = require('../factories');
const BASE_URL = '/api/products';

describe('Product Routes', () => {


    /**
     * Utility function to bulk create products
     */
    async function createProducts(count = 1) {
        const products = [];
        for (let i = 0; i < count; i++) {
            const productData = ProductFactory.build();
            const product = await Product.create(productData);
            products.push(product);
        }
        return products;
    }

    /**
     * Utility function to get product count
     */
    async function getProductCount() {
        const response = await request(app)
            .get(BASE_URL)
            .expect(200);
        return response.body.length;
    }

    describe('Basic Endpoints', () => {
        test('should return the index page', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.text).toContain('Product Catalog Administration');
        });

        test('should be healthy', async () => {
            const response = await request(app)
                .get(`${BASE_URL}/health`)
                .expect(200);

            expect(response.body.message).toBe('OK');
        });
    });



    describe('CREATE Product', () => {
        test('should create a new product', async () => {
            const testProduct = ProductFactory.build();


            const response = await request(app)
                .post(BASE_URL)
                .send(testProduct)
                .expect(201);

            // Make sure location header is set
            expect(response.headers.location).toBeDefined();

            // Check the data is correct
            const newProduct = response.body;
            expect(newProduct.name).toBe(testProduct.name);
            expect(newProduct.description).toBe(testProduct.description);
            expect(newProduct.price).toBe(testProduct.price);
            expect(newProduct.available).toBe(testProduct.available);
            expect(newProduct.category).toBe(testProduct.category);




        });

        test('should not create a product without a name', async () => {
            const productData = ProductFactory.build();
            delete productData.name;



            const response = await request(app)
                .post(BASE_URL)
                .send(productData)
                .expect(400);

            expect(response.body.error).toBe('Validation Error');
        });

        test('should not create a product with no Content-Type', async () => {
            await request(app)
                .post(BASE_URL)
                .send('bad data')
                .expect(415);
        });

        test('should not create a product with wrong Content-Type', async () => {
            await request(app)
                .post(BASE_URL)
                .set('Content-Type', 'text/plain')
                .send('some plain text data')
                .expect(415);
        });

        test('should proceed if content type is correct but has extra parameters', async () => {
            const productData = ProductFactory.build();
            const response = await request(app)
                .post(BASE_URL)
                .set('Content-Type', 'application/json; charset=utf-8')
                .send(productData);

            // We expect a 201, not a 415, because the base type is correct.
            expect(response.status).toBe(201);
        });
    });


    // ADD TEST HERE

    test('should get a single product', async () => {
        const products = await createProducts();
        const testProduct = products[0];

        const response = await request(app)
            .get(`${BASE_URL}/${testProduct.id}`)
            .expect(200);

        expect(response.body.name)
            .toBe(testProduct.name);
    })

    test('should not get a product that is not found', async () => {
        await request(app)
            .get(`${BASE_URL}/99999`)
            .expect(404);
    });

    test('should update a product', async () => {
        const products = await createProducts();
        const testProduct = products[0];

        const response = await request(app)
            .get(`${BASE_URL}/${testProduct.id}`)
            .expect(200);

        expect(response.body.name)
            .toBe(testProduct.name);

        const updatedProduct = response.body;
        updatedProduct.price = 100;

        const updateResponse = await request(app)
            .put(`${BASE_URL}/${testProduct.id}`)
            .send(updatedProduct)
            .expect(200);

        expect(updateResponse.body.price).not.toBe(testProduct.price);
        expect(updateResponse.body.price).toBe(updatedProduct.price);
    });

    test('should not update a product that is not found', async () => {
        const updatedProduct = ProductFactory.build();
        await request(app)
            .put(`${BASE_URL}/99999`)
            .send(updatedProduct)
            .expect(404);
    });

    test('should return 400 on validation error', async () => {
        const products = await createProducts();
        const testProduct = products[0];

        await request(app)
            .put(`${BASE_URL}/${testProduct.id}`)
            .send({ name: '' })
            .expect(400);
    })

    test('should delete a product if it exists', async () => {
        const products = await createProducts();
        const testProduct = products[0];

        await request(app)
            .del(`${BASE_URL}/${testProduct.id}`)
            .expect(204);

        await request(app)
            .get(`${BASE_URL}/${testProduct.id}`)
            .expect(404);
    });

    test('should not delete a product if it does not exists', async () => {

        await request(app)
            .del(`${BASE_URL}/99999`)
            .expect(404);
    });

    test('should return a products list', async () => {
        const products = await createProducts(5);

        const response = await request(app)
            .get(BASE_URL)
            .expect(200);

        expect(response.body.length).toBe(products.length);
    });

    test('should return a list by name', async () => {
        await createProducts(2);
        const product = ProductFactory.build({ name: "InTheJava" });

        await request(app)
            .post(BASE_URL)
            .send(product)
            .expect(201);

        const response = await request(app)
            .get(`${BASE_URL}?name=InTheJava`)
            .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toBe('InTheJava');
    });

    test('should filter products by category', async () => {
        const defaultCategoryProduct = ProductFactory.build({ category: 'FOOD' });
        const specialCategoryProduct = ProductFactory.build({ category: 'TOOLS' });
        await request(app).post(BASE_URL).send(defaultCategoryProduct).expect(201);
        await request(app).post(BASE_URL).send(specialCategoryProduct).expect(201);
        
        const response = await request(app)
          .get(`${BASE_URL}?category=TOOLS`)
          .expect(200);
  
        expect(response.body.length).toBe(1);
        expect(response.body[0].category).toBe('TOOLS');
      });

      test('should filter products by availability', async () => {
        const availableProduct = ProductFactory.build({ available: true });
        const unavailableProduct = ProductFactory.build({ available: false });
      
        await request(app).post(BASE_URL).send(availableProduct).expect(201);
        await request(app).post(BASE_URL).send(unavailableProduct).expect(201);
      
        const response = await request(app)
          .get(`${BASE_URL}?availability=true`)
          .expect(200);
      
        expect(response.body.length).toBe(1);
        expect(response.body[0].available).toBe(true);
      });
      
  
});