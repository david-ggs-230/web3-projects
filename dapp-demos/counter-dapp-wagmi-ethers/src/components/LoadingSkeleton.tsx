// Src/components/LoadingSkeleton.tsx
import "../App.css";

export default function LoadingSkeleton() {
    return (
        <div className="shell-container skeleton-wrapper">
            <div className="skeleton-title animate-pulse" />
            <div className="skeleton-subtitle animate-pulse" />
            <div className="skeleton-header-bar">
                <div className="skeleton-button animate-pulse" />
            </div>
            <div className="skeleton-card animate-pulse" />
        </div>
    );
}
