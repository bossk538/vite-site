import React, { useRef, useEffect } from 'react';

export const CanvasApp = () => {
    const canvasRef = useRef();
    const draw = (ctx, frameCount) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(200, 100, 50 * Math.sin(frameCount * 0.03) ** 2, 0, 2 * Math.PI);
        ctx.fill();
        const myImageData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
    };

    useEffect(() => {
        const context = canvasRef.current.getContext('2d');
        context.fillStyle = '#ffff00';
        context.fillRect(0,0, context.canvas.width, context.canvas.height);
        let frameCount = 0;
        let animationFrameId;
        const render = () => {
            frameCount++;
            draw(context, frameCount);
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();
        return () => window.cancelAnimationFrame(animationFrameId);
    }, []);

    return (
    <canvas ref={canvasRef} width="400" height="200" style={{ border: '1px solid #000000' }}>
</canvas>
    );
};
