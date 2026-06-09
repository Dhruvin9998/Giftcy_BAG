import Blog from '../models/Blog.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';

export const getAllBlogs = async (req, res, next) => {
  try {
    const isPublic = !req.headers.authorization;
    const filter = isPublic ? { published: true } : {};
    const blogs = await Blog.find(filter).sort('-createdAt');
    new ApiResponse(200, blogs, 'Blogs retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return next(new ApiError(404, 'Blog post not found'));
    }
    new ApiResponse(200, blog, 'Blog post retrieved.').send(res);
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, content, featuredImage, metaTitle, metaDescription, author, published } = req.body;
    if (!title || !content || !featuredImage) {
      return next(new ApiError(400, 'Title, content, and featured image are required.'));
    }
    const blog = await Blog.create({ title, content, featuredImage, metaTitle, metaDescription, author, published });
    new ApiResponse(201, blog, 'Blog post created successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) {
      return next(new ApiError(404, 'Blog post not found'));
    }
    new ApiResponse(200, blog, 'Blog post updated successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return next(new ApiError(404, 'Blog post not found'));
    }
    new ApiResponse(200, null, 'Blog post deleted successfully.').send(res);
  } catch (error) {
    next(error);
  }
};
