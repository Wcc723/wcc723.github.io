/**
* Excerpt Helper
* @description Get the excerpt from a post
* @example
*     <%- excerpt(post) %>
*/
hexo.extend.helper.register('excerpt', function (post) {
    var excerpt;
    if (post.excerpt) {
        excerpt = post.excerpt.replace(/\<[^\>]+\>/g, '').substring(0, 150) + '...';
    } else {
        excerpt = post.content.replace(/\<[^\>]+\>/g, '').substring(0, 150) + '...';
    }
    return excerpt;
});