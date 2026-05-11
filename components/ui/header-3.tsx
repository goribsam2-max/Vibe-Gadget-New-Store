import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
import { useTheme } from '../ThemeContext';
import Icon from '../Icon';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { 
    Home, 
    Search,
    ShoppingBag, 
    Heart, 
    User, 
    Bell,
    Box,
    ShoppingCart,
    Newspaper,
    Headset
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

type LinkItem = {
	title: string;
	href: string;
	icon: any;
	description?: string;
};

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

	useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn('sticky top-0 z-50 w-full border-b border-transparent', {
				'bg-white/95 dark:bg-zinc-900/95 supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 backdrop-blur-lg':
					scrolled,
			})}
		>
			<nav className="mx-auto flex h-14 w-full max-w-[1920px] items-center justify-between px-4 lg:px-8">
				<div className="flex items-center gap-5">
					<NavLink to="/" className="hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md p-2 flex items-center pr-4 border-zinc-200 dark:border-zinc-800">
						<WordmarkIcon className="text-emerald-500" />
					</NavLink>
					<NavigationMenu className="hidden md:flex">
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 focus:text-zinc-900 dark:focus:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800 data-[active]:bg-zinc-100 dark:data-[active]:bg-zinc-800">Discover</NavigationMenuTrigger>
								<NavigationMenuContent className="p-1 pr-1.5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
									<ul className="grid w-lg grid-cols-2 gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2 shadow">
										{productLinks.map((item, i) => (
											<li key={i}>
												<ListItem {...item} />
											</li>
										))}
									</ul>
									<div className="p-2">
										<p className="text-zinc-500 text-sm">
											Looking for something specific?{' '}
											<NavLink to="/search" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
												Search catalog
											</NavLink>
										</p>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuLink className="px-4" asChild>
								<NavLink to="/all-products" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md p-2 px-4 transition-colors">
									Catalog
								</NavLink>
							</NavigationMenuLink>
                            <NavigationMenuLink className="px-4" asChild>
								<NavLink to="/blog" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md p-2 px-4 transition-colors">
									Blog
								</NavLink>
							</NavigationMenuLink>
						</NavigationMenuList>
					</NavigationMenu>
				</div>
                
				<div className="hidden items-center gap-2 md:flex">
					<Button variant="outline" className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200" onClick={() => navigate('/profile')}>Account</Button>
					<Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => navigate('/orders')}>My Orders</Button>
				</div>
				<div className="flex items-center gap-2 md:hidden">
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setOpen(!open)}
                        className="border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        aria-label="Toggle menu"
                    >
                        <MenuToggleIcon open={open} className="size-5" duration={300} />
                    </Button>
                </div>
			</nav>

			<MobileMenu open={open} className="flex flex-col justify-between gap-2 overflow-y-auto bg-white dark:bg-zinc-900">
				<NavigationMenu className="max-w-full">
					<div className="flex w-full flex-col gap-y-2">
						<span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 px-2 mt-4 mb-2">Explore Pages</span>
						{productLinks.map((link) => (
							<ListItem key={link.title} {...link} />
						))}
					</div>
				</NavigationMenu>
				<div className="flex flex-col gap-2 p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800">
					<Button variant="outline" className="w-full bg-transparent border-zinc-200 dark:border-zinc-700" onClick={() => { setOpen(false); navigate('/profile'); }}>
						Account
					</Button>
					<Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => { setOpen(false); navigate('/orders'); }}>
                        My Orders
                    </Button>
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & {
	open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	if (!open || typeof window === 'undefined') return null;

	return createPortal(
		<div
			id="mobile-menu"
			className={cn(
				'bg-white/95 dark:bg-zinc-900/95 supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-zinc-900/50 backdrop-blur-lg',
				'fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y border-zinc-200 dark:border-zinc-800 md:hidden',
			)}
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn(
					'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 ease-out',
					'size-full',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

function ListItem({
	title,
	description,
	icon: IconComp,
	className,
	href,
	...props
}: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
	return (
		<NavigationMenuLink className={cn('w-full flex flex-row gap-x-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 rounded-xl p-2 transition-colors', className)} {...props} asChild>
			<NavLink to={href}>
				<div className="bg-zinc-100 dark:bg-zinc-800 flex aspect-square size-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
					<IconComp className="text-zinc-700 dark:text-zinc-300 size-5" />
				</div>
				<div className="flex flex-col items-start justify-center">
					<span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{title}</span>
					<span className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">{description}</span>
				</div>
			</NavLink>
		</NavigationMenuLink>
	);
}

const productLinks: LinkItem[] = [
	{
		title: 'Home',
		href: '/',
		description: 'Discover new and trending gadgets',
		icon: Home,
	},
	{
		title: 'Catalog',
		href: '/all-products',
		description: 'Browse our full collection',
		icon: Box,
	},
	{
		title: 'Wishlist',
		href: '/wishlist',
		description: 'Your saved favorite items',
		icon: Heart,
	},
	{
		title: 'My Orders',
		href: '/orders',
		description: 'Track and manage your orders',
		icon: ShoppingBag,
	},
	{
		title: 'Blog',
		href: '/blog',
		description: 'Tech news, reviews and tips',
		icon: Newspaper,
	},
	{
		title: 'Help Center',
		href: '/help',
		description: 'Get support and answers',
		icon: Headset,
	},
];


function useScroll(threshold: number) {
	const [scrolled, setScrolled] = React.useState(false);

	const onScroll = React.useCallback(() => {
		setScrolled(window.scrollY > threshold);
	}, [threshold]);

	React.useEffect(() => {
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [onScroll]);

	React.useEffect(() => {
		onScroll();
	}, [onScroll]);

	return scrolled;
}

const WordmarkIcon = (props: React.ComponentProps<"span">) => (
  <span className="font-outfit font-bold text-xl tracking-tight text-gradient" {...props}>
    Vibe Gadget
  </span>
);
