import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsByIdAPI } from '../services/userApi';
import { Calendar, User, Globe, Share2, ThumbsUp, Loader } from 'lucide-react';
import Badge from '../components/ui/Badge';

export default function PublicNewsView() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const res = await getNewsByIdAPI(id);
                setArticle(res.data);

                // Dynamically update document title for better sharing (if supported by crawler)
                if (res.data.title) {
                    document.title = res.data.title;
                    // Note: Basic meta tags can't be easily updated client-side for crawlers without SSR/Helmet, 
                    // but we do what we can.
                }
            } catch (err) {
                console.error("Failed to fetch article:", err);
                setError("Article not found or removed.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchArticle();
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <Loader className="animate-spin" size={32} />
                <p>Loading article...</p>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <h2>oops!</h2>
                <p>{error || "Article unavailable"}</p>
                <Link to="/login" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Login</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Link to="/login" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>&larr; Back to App</Link>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>{article.title}</h1>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#64748b', marginBottom: '1.5rem', flexWrap: 'wrap', fontSize: '14px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {new Date(article.date).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={14} /> {article.authorName}
                </span>
                <Badge variant="outline">{article.category}</Badge>
            </div>

            {article.image && (
                <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                    <img
                        src={article.image}
                        alt={article.title}
                        style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', display: 'block' }}
                    />
                </div>
            )}

            <div style={{ fontSize: '1.125rem', lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-wrap', marginBottom: '3rem' }}>
                {article.content}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 500 }}>
                        <ThumbsUp size={18} /> {article.likes} Likes
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 500 }}>
                        <Share2 size={18} /> {article.shares} Shares
                    </span>
                </div>
            </div>
        </div>
    );
}
