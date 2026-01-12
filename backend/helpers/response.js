/**
 * Standardized API Response Helpers
 * Ensures consistent response format across all endpoints
 */

/**
 * Success response
 */
exports.successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...data
    });
};

/**
 * Error response
 */
exports.errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Paginated response
 */
exports.paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
};

/**
 * Created response (201)
 */
exports.createdResponse = (res, data = {}, message = 'Resource created successfully') => {
    return exports.successResponse(res, data, message, 201);
};

/**
 * No content response (204)
 */
exports.noContentResponse = (res) => {
    return res.status(204).send();
};
