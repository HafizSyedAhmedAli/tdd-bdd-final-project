const { faker } = require('@faker-js/faker');
const { Product, Category } = require('../src/models/product');

class ProductFactory {
    static build(overrides = {}) {
        const product = {
            id: faker.number.int({min: 1, max: 1000}),
            name: faker.helpers.arrayElement(['Hat', 'Pants', 'Shirt', 'Apple', 'Banana', 'Pots', 'Towels', 'Ford', 'Chevy', 'Hammer', 'Wrench']),
            description: faker.lorem.paragraph(),
            price: parseFloat(faker.commerce.price({
                min: 0.5,
                max: 2000.0,
                dec: 2
            })),
            available: faker.datatype.boolean(),
            category: faker.helpers.arrayElement(Object.keys(Category))
        }

        return Object.assign(product, overrides);
    }

    static buildList(count, overrides = {}) {
        return Array.from({ length: count }, () => this.build(overrides));
    }

    static async create(overrides = {}) {
        const productData = this.build(overrides);
        delete productData.id;
        return await Product.create(productData);
    }

    static async createList(count, overrides = {}) {
        const productList = this.buildList(count, overrides);
        productList.map(product => delete product.id);
        return await Product.bulkCreate(productList);
    }
}

module.exports = { ProductFactory };