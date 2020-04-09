class APIFeatures {
    constructor(query/*Tour.find()*/, queryString/*query*/) {
        this.query = query;
        this.queryString = queryString
    }

    // 1A) Simple filtring
    filter() {
        let queryObj = { ...this.queryString };
        const exluded = ['sort', 'page', 'limit', 'fields'];
        exluded.forEach(cur => {
            delete queryObj[cur]
        })
        // 1B) Advanced filtring
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryStr)); // save the query without executing to use it later (chaining more methode like sort)

        return this; //it refers to the object instance on which the method is currently being called. It's used for chaining.
    }

    // 2) Sorting by (difficulty, price .. )
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')
        }

        return this;
    }

    // 3) Projection (fields to show or not)
    fields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }

        return this;
    }

    // 4) Pagination  
    paginate() {
        let page = this.queryString.page * 1 || 1;
        let limit = this.queryString.limit * 1 || 100;
        const skip = limit * (page - 1)
        this.query = this.query.skip(skip).limit(limit)

        return this;
    }
}

module.exports = APIFeatures;