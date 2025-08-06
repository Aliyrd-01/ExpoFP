import React, { useEffect, useState, useRef } from "react";

export const Draggable = ({ 
    children, 
    className, 
    initialPosition,
}: {
    children: React.ReactNode;
    className?: string;
    initialPosition?: { x: number; y: number };
}) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const draggableRef = useRef(null);

    const skipDrag = (e) => {
        const tag = e.target.tagName;
        const interactiveElements = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"]);
        return (interactiveElements.has(tag) || e.target.isContentEditable);
    };

    const handleMouseDown = (e) => {
        if (skipDrag(e)) {
            return;
        }

        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        endDrag();
    };

    const handleTouchStart = (e) => {
        if (skipDrag(e)) {
            return;
        }

        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
        });
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;

        setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
        endDrag();
    };

    const endDrag = () => {
        if (!draggableRef.current) return;

        const rect = draggableRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const limitWidth = rect.width / 4;
        const limitHeight = rect.height / 4;

        const hiddenLeft = Math.max(0, 0 - rect.left);
        const hiddenRight = Math.max(0, rect.right - viewportWidth);
        const hiddenTop = Math.max(0, 0 - rect.top);
        const hiddenBottom = Math.max(0, rect.bottom - viewportHeight);

        const isPartiallyOutX = hiddenLeft > limitWidth || hiddenRight > limitWidth;
        const isPartiallyOutY = hiddenTop > limitHeight || hiddenBottom > limitHeight;

        if (isPartiallyOutX || isPartiallyOutY) {
            setPosition({ x: 0, y: 0 });
        }

        setIsDragging(false);
    };

    useEffect(() => {
        if (!initialPosition) return;
        setPosition(initialPosition);
    }, [initialPosition]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.addEventListener("touchmove", handleTouchMove, { passive: false });
            document.addEventListener("touchend", handleTouchEnd);
        } else {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isDragging, dragStart]);

    return (
        <div
            ref={draggableRef}
            className={className}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {children}
        </div>
    );
};
