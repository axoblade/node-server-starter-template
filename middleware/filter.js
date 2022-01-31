const advancedFilter = (model, populate) => async (req, res, next) => {
    //initialize a query builder
    let query;

    const reqQuery = { ...req.query };

    //array of fields to exclude from filtering
    const removeFields = ['select','sort','page','limit'];

    //check the removed fileds and elete from request

    removeFields.forEach(param => delete reqQuery[param]);
    
    let queryStr = JSON.stringify(reqQuery);

    //allow operators like ($gt, $gte etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = model.find(JSON.parse(queryStr));

    //SELECT fields query
    if (req.query.select) {
        ///split request selelct fields into array
        const fields = req.query.select.split(',').join(' ');

        query = query.select(fields);
    }

    //sort fields query
    if (req.query.sort) {
        ///split request sort fields into array
        const sortBy = req.query.sort.split(',').join(' ');

        query = query.sort(sortBy);
    } else {
        //default sort
        query = query.sort('createdAt');
    }
    
    //pagination of the results
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 1000;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }


    const data = await query;

    //pagination results
    const pagination = {};

    //remove a previous or next if non existent
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.advancedFilter = {
        success: true,
        msg: "SUCCESS",
        pagination,
        data: {
            'count': data.length,
            'records': data
        }
    }
    next();
};

module.exports = advancedFilter;