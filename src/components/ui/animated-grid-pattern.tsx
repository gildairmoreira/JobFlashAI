'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedGridPattern() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const columns = 20;
    const rows = 12;

    // Generate random cells that will be animated
    const animatedCells = Array.from({ length: 30 }).map(() => ({
        col: Math.floor(Math.random() * columns),
        row: Math.floor(Math.random() * rows),
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            <div
                className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"
                style={{
                    perspective: '1000px',
                }}
            >
                <div
                    className="w-[120%] h-[120%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        transform: 'translate(-50%, -50%) rotateX(45deg)',
                    }}
                >
                    {/* Base Grid */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
                        {Array.from({ length: columns * rows }).map((_, i) => (
                            <div key={i} className="border-[0.5px] border-stone-200/40 w-full h-full" />
                        ))}
                    </div>

                    {/* Animated Highlighted Cells */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
                        {animatedCells.map((cell, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.4, 0] }}
                                transition={{
                                    duration: cell.duration,
                                    repeat: Infinity,
                                    delay: cell.delay,
                                    ease: "easeInOut",
                                }}
                                className="bg-blue-400 w-full h-full"
                                style={{
                                    gridColumn: cell.col + 1,
                                    gridRow: cell.row + 1,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
