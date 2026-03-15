"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Eraser, Circle, Square, Minus, Type, Download, Trash2, Undo, Redo } from 'lucide-react';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  id: number;
  userId: string;
  strokeData: {
    path: Point[];
    color: string;
    width: number;
    opacity: number;
  };
  createdAt: string;
}

interface Shape {
  id: number;
  userId: string;
  shapeType: string;
  shapeData: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    fill?: string;
    stroke?: string;
  };
  createdAt: string;
}

interface WhiteboardCanvasProps {
  workshopId: number;
  userId: string;
  isHost: boolean;
}

type Tool = 'pencil' | 'eraser' | 'circle' | 'rectangle' | 'line' | 'text';

export default function WhiteboardCanvas({ workshopId, userId, isHost }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  // Fetch whiteboard content
  useEffect(() => {
    fetchWhiteboardContent();
    const interval = setInterval(fetchWhiteboardContent, 2000);
    return () => clearInterval(interval);
  }, [workshopId]);

  // Redraw canvas when strokes/shapes change
  useEffect(() => {
    redrawCanvas();
  }, [strokes, shapes]);

  const fetchWhiteboardContent = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/whiteboard?id=${workshopId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStrokes(data.strokes || []);
        setShapes(data.shapes || []);
      }
    } catch (error) {
      console.error('Error fetching whiteboard:', error);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach(stroke => {
      const { path, color, width, opacity } = stroke.strokeData;
      if (path.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw all shapes
    shapes.forEach(shape => {
      const { shapeType, shapeData } = shape;
      ctx.strokeStyle = shapeData.stroke || '#000000';
      ctx.fillStyle = shapeData.fill || 'transparent';
      ctx.lineWidth = 2;

      switch (shapeType) {
        case 'rectangle':
          if (shapeData.fill !== 'transparent') {
            ctx.fillRect(shapeData.x!, shapeData.y!, shapeData.width!, shapeData.height!);
          }
          ctx.strokeRect(shapeData.x!, shapeData.y!, shapeData.width!, shapeData.height!);
          break;
        case 'circle':
          ctx.beginPath();
          const radius = Math.sqrt(Math.pow(shapeData.width!, 2) + Math.pow(shapeData.height!, 2)) / 2;
          ctx.arc(shapeData.x! + shapeData.width! / 2, shapeData.y! + shapeData.height! / 2, radius, 0, Math.PI * 2);
          if (shapeData.fill !== 'transparent') ctx.fill();
          ctx.stroke();
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(shapeData.x1!, shapeData.y1!);
          ctx.lineTo(shapeData.x2!, shapeData.y2!);
          ctx.stroke();
          break;
      }
    });
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    
    if (tool === 'pencil' || tool === 'eraser') {
      setCurrentPath([point]);
    } else {
      setStartPoint(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e);

    if (tool === 'pencil' || tool === 'eraser') {
      setCurrentPath(prev => [...prev, point]);
      drawPreview([...currentPath, point]);
    } else if (startPoint) {
      drawShapePreview(startPoint, point);
    }
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const point = getCanvasPoint(e);

    try {
      const token = localStorage.getItem('bearer_token');

      if (tool === 'pencil' || tool === 'eraser') {
        if (currentPath.length < 2) return;

        // Save stroke
        const response = await fetch(`/api/workshops/${workshopId}/whiteboard/stroke`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            strokeData: {
              path: currentPath,
              color: tool === 'eraser' ? '#FFFFFF' : color,
              width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
              opacity: 1
            }
          })
        });

        if (response.ok) {
          await fetchWhiteboardContent();
          setCurrentPath([]);
        }
      } else if (startPoint) {
        // Save shape
        let shapeData: any = {};
        
        switch (tool) {
          case 'rectangle':
          case 'circle':
            shapeData = {
              x: Math.min(startPoint.x, point.x),
              y: Math.min(startPoint.y, point.y),
              width: Math.abs(point.x - startPoint.x),
              height: Math.abs(point.y - startPoint.y),
              fill: 'transparent',
              stroke: color
            };
            break;
          case 'line':
            shapeData = {
              x1: startPoint.x,
              y1: startPoint.y,
              x2: point.x,
              y2: point.y,
              stroke: color
            };
            break;
        }

        const response = await fetch(`/api/workshops/${workshopId}/whiteboard/shape`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            shapeType: tool,
            shapeData
          })
        });

        if (response.ok) {
          await fetchWhiteboardContent();
          setStartPoint(null);
        }
      }
    } catch (error) {
      console.error('Error saving to whiteboard:', error);
      toast.error('Failed to save drawing');
    }
  };

  const drawPreview = (path: Point[]) => {
    const canvas = canvasRef.current;
    if (!canvas || path.length < 2) return;

    redrawCanvas();
    
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  };

  const drawShapePreview = (start: Point, end: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    redrawCanvas();
    
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    switch (tool) {
      case 'rectangle':
        ctx.strokeRect(
          Math.min(start.x, end.x),
          Math.min(start.y, end.y),
          Math.abs(end.x - start.x),
          Math.abs(end.y - start.y)
        );
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;
        ctx.beginPath();
        ctx.arc(
          start.x + (end.x - start.x) / 2,
          start.y + (end.y - start.y) / 2,
          radius,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        break;
    }
  };

  const handleClearBoard = async () => {
    if (!isHost) {
      toast.error('Only the host can clear the whiteboard');
      return;
    }

    if (!confirm('Are you sure you want to clear the entire whiteboard?')) return;

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/whiteboard?id=${workshopId}&hostUserId=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setStrokes([]);
        setShapes([]);
        toast.success('Whiteboard cleared');
      }
    } catch (error) {
      console.error('Error clearing whiteboard:', error);
      toast.error('Failed to clear whiteboard');
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${workshopId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Whiteboard exported');
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Collaborative Whiteboard</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {isHost && (
              <Button variant="destructive" size="sm" onClick={handleClearBoard}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4 p-4 bg-muted rounded-lg">
          {/* Tools */}
          <div className="flex gap-2">
            <Button
              variant={tool === 'pencil' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('pencil')}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('eraser')}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('rectangle')}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('circle')}
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('line')}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          {/* Colors */}
          <div className="flex gap-2 ml-4">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded border-2 ${color === c ? 'border-primary' : 'border-border'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Stroke width */}
          <div className="flex items-center gap-2 ml-4">
            <label className="text-sm">Width:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-24"
            />
            <Badge variant="outline">{strokeWidth}px</Badge>
          </div>
        </div>

        {/* Canvas */}
        <div className="border-2 border-border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDrawing(false)}
            className="cursor-crosshair w-full"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Total strokes: {strokes.length}</span>
          <span>Total shapes: {shapes.length}</span>
        </div>
      </CardContent>
    </Card>
  );
}
