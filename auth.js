function parseCookies(req) {
    const list = {};
    const rc = req.headers.cookie;
    rc && rc.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
}

function requireLogin(req, res, next) {
    const cookies = parseCookies(req);

    if (!cookies.userId) {
        res.writeHead(302, { Location: '/login' });
        return res.end(); // ✅ stops here immediately
    }

    next(cookies.userId);
}

module.exports = { parseCookies, requireLogin };