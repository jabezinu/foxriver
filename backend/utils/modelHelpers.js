/**
 * Add MongoDB compatibility to Sequelize models
 * This adds _id as an alias for id in JSON responses
 */
const addMongoCompatibility = (model) => {
    const originalToJSON = model.prototype.toJSON;
    
    model.prototype.toJSON = function() {
        const values = originalToJSON ? originalToJSON.call(this) : { ...this.dataValues };
        
        // Add _id as alias for id for MongoDB compatibility
        if (values.id !== undefined) {
            values._id = values.id;
        }
        
        return values;
    };
};

module.exports = { addMongoCompatibility };
