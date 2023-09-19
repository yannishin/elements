import { faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { Box, Flex, Icon } from '@stoplight/mosaic';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

type SidebarLayoutProps = {
  sidebar: React.ReactNode;
  maxContentWidth?: number;
  sidebarWidth?: number;
  children?: React.ReactNode;
};

const MAX_CONTENT_WIDTH = 3800;
const SIDEBAR_WIDTH = 300;
const SIDEBAR_MIN_WIDTH = 15;
const SIDEBAR_MAX_WIDTH = 1.5 * SIDEBAR_WIDTH;

export const SidebarLayout = React.forwardRef<HTMLDivElement, SidebarLayoutProps>(
  ({ sidebar, children, maxContentWidth = MAX_CONTENT_WIDTH, sidebarWidth = SIDEBAR_WIDTH }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement | null>(null);
    const [sidebarRef, currentSidebarWidth, startResizing, foldSidebar] = useResizer(sidebarWidth);
    const { pathname } = useLocation();

    React.useEffect(() => {
      // Scroll to top on page change
      scrollRef.current?.scrollTo(0, 0);
    }, [pathname]);

    return (
      <Flex ref={ref} className="sl-elements-api" pin h="full">
        <Flex
          ref={sidebarRef}
          onMouseDown={(e: React.MouseEvent<HTMLElement>) => e.preventDefault()}
          style={{ maxWidth: `${SIDEBAR_MAX_WIDTH}px` }}
        >
          <Flex
            direction="col"
            bg="canvas-100"
            borderR
            pt={2}
            mr={0.5}
            pos="sticky"
            pinY
            overflowY="auto"
            style={{
              paddingLeft: `calc((100% - ${maxContentWidth}px) / 2)`,
              width: `${currentSidebarWidth}px`,
              minWidth: `${SIDEBAR_MIN_WIDTH}px`,
            }}
          >
            {sidebar}
          </Flex>
          <Flex
            justifySelf="end"
            flexGrow={0}
            flexShrink={0}
            pt={2}
            resize="x"
            onMouseDown={startResizing}
            style={{ width: '1em', flexBasis: '6px', cursor: 'ew-resize' }}
          >
            <Box
              as={Icon}
              icon={faRightLeft}
              size="sm"
              style={{ verticalAlign: 'middle', margin: 'auto', cursor: 'pointer' }}
              onClick={foldSidebar}
            />
          </Flex>
        </Flex>

        <Box ref={scrollRef} bg="canvas-50" px={4} flex={1} w="full" overflowY="auto">
          <Box style={{ maxWidth: `${maxContentWidth - currentSidebarWidth}px` }} py={16}>
            {children}
          </Box>
        </Box>
      </Flex>
    );
  },
);

type SidebarRef = React.Ref<HTMLDivElement>;
type SidebarWidth = number;
type StartResizingFn = () => void;
type foldSidebarFn = () => void;

function useResizer(sidebarWidth: number): [SidebarRef, SidebarWidth, StartResizingFn, foldSidebarFn] {
  const sidebarRef = React.useRef<HTMLDivElement | null>(null);
  const [isResizing, setIsResizing] = React.useState(false);
  const [currentSidebarWidth, setCurrentSidebarWidth] = React.useState(sidebarWidth);
  const [isFolding, setIsFolding] = React.useState(false);

  const startResizing = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const foldSidebar = React.useCallback(() => {
    console.log('isFolding', isFolding);
    if (isFolding) {
      setCurrentSidebarWidth(SIDEBAR_WIDTH);
      setIsFolding(false);
    } else {
      setCurrentSidebarWidth(SIDEBAR_MIN_WIDTH);
      setIsFolding(true);
    }
  }, [isFolding]);

  const resize = React.useCallback(
    mouseMoveEvent => {
      if (isResizing) {
        const value = mouseMoveEvent.clientX - sidebarRef.current!.getBoundingClientRect().left;
        setCurrentSidebarWidth(Math.min(Math.max(SIDEBAR_MIN_WIDTH, value), SIDEBAR_MAX_WIDTH));
      }
    },
    [isResizing],
  );

  React.useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing, { passive: true });
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return [sidebarRef, currentSidebarWidth, startResizing, foldSidebar];
}
