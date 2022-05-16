const BlogModel = require("../models/blogModel")
const AuthorModel = require("../models/authorModel")


const isValid= function(value){
    if(typeof (value) === undefined || typeof (value) === null) {return false}
    if(typeof (value) === "string" && (value).trim().length>0) {return true}
}

const isArray= function(value){
    if (typeof (value) === "object") {
        value = value.filter(x => x.trim())
        if (value.length == 0) return false
        else return true
    }
}


const createBlog = async function (req, res) {
    try {
        let data = req.body
        
        // checking if data is empty
        if (Object.keys(data) == 0){
            return res.status(400).send({ status: false, msg: "Bad request. Content to post missing" })}

        let {title , body , authorId, category, subcategory, tags}= data


        let idMatch = await AuthorModel.findById(authorId)
        // id match in author model, if not
        if (!idMatch){
            return res.status(404).send({ status: false, msg: "No such author present in the database" })}

        if (!isValid(authorId)) return res.status(400).send({ status: false, msg: 'please provide authorId' })

        if (!isValid(title)) return res.status(400).send({ status: false, msg: 'please provide title' })

        if (!isArray(category)) return res.status(400).send({ status: false, msg: 'please provide category' })

        if (!isValid(body)) return res.status(400).send({ status: false, msg: 'please provide body' })

        if (!isArray(subcategory)) return res.status(400).send({ status: false, msg: 'please provide subcategory' })

        if (!isArray(tags)) return res.status(400).send({ status: false, msg: 'please provide tags' })

        let savedData = await BlogModel.create(data)
        //creating entry in db with status 201 success!
        return res.status(201).send({ status: true, msg: savedData })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ msg: error.message })
    }
}


const getAllBlogs = async function (req, res) {
    try {
        const filter = req.query
        if (Object.keys(data) == 0) return res.status(400).send({ status: false, msg: "No input provided" })

        if (filter.category != undefined) {
            if (!isValid(filter.category)) return res.status(400).send({ status: false, msg: 'please provide category' })
        }
        if (filter.subcategory != undefined) {
            if (!isValid(filter.subcategory)) return res.status(400).send({ status: false, msg: 'please provide subcategory' })
        }
        if (filter.tags != undefined) {
            if (!isValid(filter.tags)) return res.status(400).send({ status: false, msg: 'please provide tags' })
        }
        if (filter.authorId != undefined) {
            if (!isValid(filter.authorId)) return res.status(400).send({ status: false, msg: 'please provide authorId' })
        }

        const blogs = await BlogModel.find({$and : [filter, { isDeleted: false }, { isPublished: true }]}).populate("authorId")

        if (blogs.length == 0) return res.status(404).send({ status: false, msg: "No blogs Available." })

        return res.status(200).send({ status: true,count:blogs.length, data: blogs });
    }


    catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
}


const updateBlog = async function (req, res) {
    try {
        //Validate: The blogId is present in request path params or not.
        let blog_Id = req.params.blogId
        if (!blog_Id) return res.status(400).send({ status: false, msg: "Blog Id is required" })

        //Validate: The blogId is valid or not.
        let blog = await BlogModel.findById(blog_Id)
        if (!blog) return res.status(404).send({ status: false, msg: "Blog does not exists" })

        //Validate: If the blogId exists (must have isDeleted false)
        let is_Deleted = blog.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, msg: "Blog is already deleted" })

        //Updates a blog by changing the its title, body, adding tags, adding a subcategory.
        let Title = req.body.title
        let Body = req.body.body
        let Tags = req.body.tags
        let Subcategory = req.body.subcategory

        if (Title != undefined) {
            if (!isValid(Title)) return res.status(400).send({ status: false, msg: 'please provide title' })
        }
        if (Subcategory != undefined) {
            if (!isValid(Subcategory)) return res.status(400).send({ status: false, msg: 'please provide subcategory' })
        }
        if (Tags != undefined) {
            if (!isValid(Tags)) return res.status(400).send({ status: false, msg: 'please provide tags' })
        }
        if (Body != undefined) {
            if (!isValid(Body)) return res.status(400).send({ status: false, msg: 'please provide body' })
        }


        let updatedBlog = await BlogModel.findOneAndUpdate({ _id: blogId },
            {
                $set: { title: Title, body: Body, isPublished: true, publishedAt: new Date() },
                $addToSet: { subcategory: Subcategory, tags: Tags }
            }, { new: true })
        //Sending the updated response
        return res.status(200).send({ status: true, data: updatedBlog })
    }
    catch (err) {
        console.log("This is the error :", err.message)
        return res.status(500).send({ status: false, msg: " Server Error", error: err.message })
    }
}



const deleted = async function (req, res) {
    try {
        //Validate: The blogId is present in request path params or not.
        let blog_Id = req.params.blogId
        if (!blog_Id) return res.status(400).send({ status: false, msg: "Blog Id is required" })

        //Validate: The blogId is valid or not.
        let blog = await BlogModel.findById(blog_Id)
        if (!blog) return res.status(404).send({ status: false, msg: "Blog does not exists" })

        //Validate: If the blogId is not deleted (must have isDeleted false)
        let is_Deleted = blog.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, msg: "Blog is already deleted" })

        //Delete a blog by changing the its isDeleted to true.
        let deletedBlog = await BlogModel.findOneAndUpdate({ _id: blog_Id },
            { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        //Sending the Deleted response after updating isDeleted : true
        return res.status(200).send({ status: true, msg: "Blog deleted succesfully" })
    }
    catch (err) {
        console.log("This is the error :", err.message)
        return res.status(500).send({ status: false, msg: " Server Error", error: err.message })
    }
}

const Qdeleted = async function (req, res) {
    try {
        const filters = req.query
        if (Object.keys(filters) == 0) return res.status(400).send({ status: false, msg: "No input provided" })
        
         if (filters.category != undefined) {
            if (!isValid(filters.category)) return res.status(400).send({ status: false, msg: 'please provide category' })
        }
        if (filters.subcategory != undefined) {
            if (!isValid(filters.subcategory)) return res.status(400).send({ status: false, msg: 'please provide subcategory' })
        }
        if (filters.tags != undefined) {
            if (!isValid(filters.tags)) return res.status(400).send({ status: false, msg: 'please provide tags' })
        }
        if (filters.authorId != undefined) {
            if (!isValid(filters.authorId)) return res.status(400).send({ status: false, msg: 'please provide authorId' })
        }
        if (filters.isPublished != undefined) {
            if (!isValid(filters.isPublished)) return res.status(400).send({ status: false, msg: 'please provide isPublished' })
        }
        
        const blog = await BlogModel.find(filters)
        if (!blog.length > 0) return res.status(404).send({ msg: "No blog exist with given filters " })

        // checking if blog already deleted 
        let blogs = await BlogModel.find({ authorId: req.query.authorId , isDeleted : false})
        if (!blogs.length > 0) return res.status(400).send({ status: false, msg: "Blogs are already deleted" })
        
        const deleteBYquery = await BlogModel.updateMany({ $and : [data , {isPublished : false} ]}, { isDeleted: true, deletedAt: new Date() }, { new: true })
        
        if (!deleteBYquery) return res.status(404).send({ status: false, msg: "no such blog found" })
        
        return res.status(200).send({ status: true, msg: 'Blog deleted successfully' })
    }


    catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
};








module.exports.createBlog = createBlog
module.exports.updateBlog = updateBlog
module.exports.deleted = deleted
module.exports.getAllBlogs = getAllBlogs
module.exports.Qdeleted = Qdeleted
