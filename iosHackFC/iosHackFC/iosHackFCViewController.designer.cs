//
// This file has been generated automatically by MonoDevelop to store outlets and
// actions made in the Xcode designer. If it is removed, they will be lost.
// Manual changes to this file may not be handled correctly.
//
using MonoTouch.Foundation;

namespace iosHackFC
{
	[Register ("iosHackFCViewController")]
	partial class iosHackFCViewController
	{
		[Outlet]
		MonoTouch.UIKit.UIButton btnTakePicture { get; set; }

		[Outlet]
		MonoTouch.UIKit.UIImageView imgSnapshot { get; set; }

		void ReleaseDesignerOutlets ()
		{
			if (btnTakePicture != null) {
				btnTakePicture.Dispose ();
				btnTakePicture = null;
			}

			if (imgSnapshot != null) {
				imgSnapshot.Dispose ();
				imgSnapshot = null;
			}
		}
	}
}
